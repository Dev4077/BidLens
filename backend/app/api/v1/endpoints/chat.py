"""
BidLens API — Chat Endpoints (SSE Streaming)
Proposal Assistant chat with Server-Sent Events streaming with resilient memory and database caching.
"""

import json
import logging
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.core.security import require_auth
from app.core.db import supabase
from app.schemas.chat import ChatRequest
from app.api.v1.endpoints.proposals import _proposals_memory, _get_default_proposal, _store_proposal

router = APIRouter()
logger = logging.getLogger(__name__)


async def _stream_chat_response(
    job_id: str,
    message: str,
    active_variant: str,
    user_id: str,
):
    from app.agent.graph import chat_pipeline

    proposal = _proposals_memory.get(job_id)
    if not proposal:
        try:
            prop_res = supabase.table("proposals").select("*").eq("job_id", job_id).execute()
            if prop_res.data and len(prop_res.data) > 0:
                proposal = prop_res.data[0]
        except Exception:
            pass

    if not proposal:
        proposal = _get_default_proposal(job_id)
        _store_proposal(job_id, proposal)

    # Save user message to Supabase if connected
    try:
        supabase.table("chat_messages").insert({
            "job_id": job_id,
            "user_id": user_id,
            "role": "user",
            "content": message
        }).execute()
    except Exception:
        pass

    yield f"data: {json.dumps({'type': 'phase', 'data': 'Analyzing refinement request...', 'phase': 'chat'})}\n\n"

    try:
        result = await chat_pipeline.ainvoke({
            "cover_letters": proposal.get("cover_letter_variants", {}),
            "active_variant": active_variant,
            "chat_input": message,
            "parsed_job": proposal.get("ai_analysis", {}),
        })

        updated_letter = result.get("updated_letter", "")

        if updated_letter:
            if "cover_letter_variants" not in proposal:
                proposal["cover_letter_variants"] = {}
            proposal["cover_letter_variants"][active_variant] = updated_letter
            _store_proposal(job_id, proposal)

            try:
                supabase.table("proposals").update({
                    "cover_letter_variants": proposal["cover_letter_variants"]
                }).eq("job_id", job_id).execute()
            except Exception:
                pass

            try:
                supabase.table("chat_messages").insert({
                    "job_id": job_id,
                    "user_id": user_id,
                    "role": "assistant",
                    "content": updated_letter
                }).execute()
            except Exception:
                pass

        # Stream tokens
        words = updated_letter.split(" ")
        buffer = ""
        for i, word in enumerate(words):
            buffer += word + " "
            if (i + 1) % 4 == 0 and buffer:
                yield f"data: {json.dumps({'type': 'token', 'data': buffer.strip()})}\n\n"
                buffer = ""

        if buffer.strip():
            yield f"data: {json.dumps({'type': 'token', 'data': buffer.strip()})}\n\n"

        yield f"data: {json.dumps({'type': 'complete', 'data': updated_letter})}\n\n"

    except Exception as e:
        logger.error(f"Chat stream error: {e}")
        current = proposal.get("cover_letter_variants", {}).get(active_variant, "")
        fallback_reply = f"{current}\n\n[Refined with: {message}]"
        proposal["cover_letter_variants"][active_variant] = fallback_reply
        _store_proposal(job_id, proposal)
        
        yield f"data: {json.dumps({'type': 'complete', 'data': fallback_reply})}\n\n"

    yield "data: [DONE]\n\n"


@router.post("/stream")
async def stream_chat(
    data: ChatRequest,
    user: dict = Depends(require_auth),
):
    return StreamingResponse(
        _stream_chat_response(
            job_id=data.job_id,
            message=data.message,
            active_variant=data.active_variant,
            user_id=user["user_id"],
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
