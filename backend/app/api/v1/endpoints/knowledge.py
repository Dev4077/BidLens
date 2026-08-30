"""
BidLens API — Knowledge Base Endpoints
Document upload, listing, statistics, and deletion with strict multi-tenant user isolation.
"""

from datetime import datetime, timezone
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.core.security import require_auth
from app.core.db import supabase
from app.schemas.knowledge import DocumentResponse, KnowledgeBaseStats
from app.services.document_processor import process_document

router = APIRouter()
logger = logging.getLogger(__name__)

_demo_documents: list[dict] = []


@router.get("", response_model=list[DocumentResponse])
async def list_documents(user: dict = Depends(require_auth)):
    """List all knowledge base documents for the authenticated user."""
    user_id = user["user_id"]
    try:
        res = supabase.table("knowledge_documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        if res.data and len(res.data) > 0:
            return [DocumentResponse(**d) for d in res.data]
    except Exception as e:
        logger.warning(f"Supabase list documents notice: {e}")

    user_docs = [d for d in _demo_documents if d.get("user_id") == user_id]
    return [DocumentResponse(**d) for d in user_docs]


@router.get("/stats", response_model=KnowledgeBaseStats)
async def get_stats(user: dict = Depends(require_auth)):
    """Get knowledge base statistics for the authenticated user."""
    user_id = user["user_id"]
    try:
        res = supabase.table("knowledge_documents").select("*").eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            docs = res.data
            return KnowledgeBaseStats(
                total_documents=len(docs),
                total_chunks=sum(d.get("total_chunks", 0) for d in docs),
                indexed_count=sum(1 for d in docs if d.get("status") == "indexed"),
                processing_count=sum(1 for d in docs if d.get("status") == "processing"),
            )
    except Exception as e:
        logger.warning(f"Supabase stats notice: {e}")

    user_docs = [d for d in _demo_documents if d.get("user_id") == user_id]
    return KnowledgeBaseStats(
        total_documents=len(user_docs),
        total_chunks=sum(d.get("total_chunks", 0) for d in user_docs),
        indexed_count=sum(1 for d in user_docs if d.get("status") == "indexed"),
        processing_count=0,
    )


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    user: dict = Depends(require_auth),
):
    """Upload a document to the knowledge base and trigger processing for the user."""
    user_id = user["user_id"]
    file_content = await file.read()
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "txt"
    doc_id = f"doc-{int(datetime.now(timezone.utc).timestamp())}"

    doc_record = {
        "id": doc_id,
        "user_id": user_id,
        "filename": file.filename,
        "file_type": ext,
        "status": "processing",
        "size": len(file_content),
        "total_chunks": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        res = supabase.table("knowledge_documents").insert(doc_record).execute()
        if res.data:
            doc_record = res.data[0]
            doc_id = doc_record["id"]
    except Exception as e:
        logger.warning(f"Supabase document insert notice: {e}")

    # Process chunks & embeddings
    proc_result = await process_document(
        file_content=file_content,
        filename=file.filename,
        document_id=doc_id,
        user_id=user_id,
    )

    doc_record["status"] = proc_result.get("status", "indexed")
    doc_record["total_chunks"] = proc_result.get("chunks", 1)

    try:
        supabase.table("knowledge_documents").update({
            "status": doc_record["status"],
            "total_chunks": doc_record["total_chunks"],
        }).eq("id", doc_id).execute()
    except Exception:
        pass

    _demo_documents.insert(0, doc_record)
    return DocumentResponse(**doc_record)


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: str, user: dict = Depends(require_auth)):
    """Delete a document belonging to the user."""
    user_id = user["user_id"]
    try:
        supabase.table("knowledge_documents").delete().eq("id", document_id).eq("user_id", user_id).execute()
        supabase.table("document_chunks").delete().eq("document_id", document_id).eq("user_id", user_id).execute()
    except Exception as e:
        logger.warning(f"Supabase delete document notice: {e}")

    global _demo_documents
    _demo_documents = [d for d in _demo_documents if not (d["id"] == document_id and d.get("user_id") == user_id)]
