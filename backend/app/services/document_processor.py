"""
BidLens Services — Document Processor
Handles file parsing, text chunking, embedding generation, and vector storage.
"""

import io
import logging
from typing import BinaryIO

from app.core import get_settings
from app.core.db import supabase

logger = logging.getLogger(__name__)


def parse_file(file_content: bytes, filename: str) -> str:
    """
    Parse file content based on extension and return extracted text.
    Supports: PDF, DOCX, TXT, MD, CSV.
    """
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension in ("txt", "md"):
        return file_content.decode("utf-8", errors="replace")

    elif extension == "csv":
        return file_content.decode("utf-8", errors="replace")

    elif extension == "pdf":
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(file_content))
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            return "\n\n".join(text_parts)
        except Exception as e:
            logger.warning(f"PDF parsing error: {e}")
            return f"[PDF file: {filename} - parsing error: {str(e)}]"

    elif extension == "docx":
        try:
            from docx import Document
            doc = Document(io.BytesIO(file_content))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n\n".join(paragraphs)
        except Exception as e:
            logger.warning(f"DOCX parsing error: {e}")
            return f"[DOCX file: {filename} - parsing error: {str(e)}]"

    else:
        # Try to decode as text
        try:
            return file_content.decode("utf-8", errors="replace")
        except Exception:
            return f"[Unsupported file type: {extension}]"


def chunk_text(
    text: str,
    chunk_size: int = 512,
    chunk_overlap: int = 50,
) -> list[str]:
    """
    Split text into overlapping chunks using a recursive character splitter approach.
    """
    if not text.strip():
        return []

    settings = get_settings()
    chunk_size = settings.chunk_size or chunk_size
    chunk_overlap = settings.chunk_overlap or chunk_overlap

    separators = ["\n\n", "\n", ". ", " "]
    chunks: list[str] = []

    def _split_recursive(t: str, seps: list[str]) -> list[str]:
        if len(t) <= chunk_size:
            return [t] if t.strip() else []

        sep = seps[0] if seps else " "
        remaining_seps = seps[1:] if len(seps) > 1 else []

        parts = t.split(sep)
        current_chunk = ""
        results = []

        for part in parts:
            candidate = current_chunk + (sep if current_chunk else "") + part
            if len(candidate) <= chunk_size:
                current_chunk = candidate
            else:
                if current_chunk:
                    results.append(current_chunk.strip())
                if len(part) > chunk_size and remaining_seps:
                    results.extend(_split_recursive(part, remaining_seps))
                else:
                    current_chunk = part

        if current_chunk.strip():
            results.append(current_chunk.strip())

        return results

    raw_chunks = _split_recursive(text, separators)

    # Add overlap between consecutive chunks
    for i, chunk in enumerate(raw_chunks):
        if i > 0 and chunk_overlap > 0:
            prev = raw_chunks[i - 1]
            overlap_text = prev[-chunk_overlap:] if len(prev) > chunk_overlap else prev
            chunk = overlap_text + " " + chunk
        chunks.append(chunk.strip())

    return [c for c in chunks if len(c) > 20]


async def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of text chunks using OpenAI.
    """
    settings = get_settings()

    if not settings.openai_api_key:
        logger.warning("No OpenAI API key configured, returning dummy embeddings")
        return [[0.0] * settings.embedding_dimensions for _ in texts]

    try:
        from langchain_openai import OpenAIEmbeddings
        embeddings = OpenAIEmbeddings(
            model=settings.openai_embedding_model,
            api_key=settings.openai_api_key,
        )
        return await embeddings.aembed_documents(texts)
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        return [[0.0] * settings.embedding_dimensions for _ in texts]


async def process_document(
    file_content: bytes,
    filename: str,
    document_id: str,
    user_id: str,
) -> dict:
    """
    Full document processing pipeline:
    1. Parse file content
    2. Chunk text
    3. Generate embeddings
    4. Store chunks and embeddings in pgvector (via Supabase document_chunks table)
    
    Returns processing stats.
    """
    logger.info(f"Processing document: {filename} for user: {user_id}")

    # 1. Parse
    text = parse_file(file_content, filename)
    if not text.strip():
        return {"status": "failed", "error": "No text extracted", "chunks": 0}

    # 2. Chunk
    chunks = chunk_text(text)
    if not chunks:
        return {"status": "failed", "error": "No chunks generated", "chunks": 0}

    # 3. Generate embeddings
    embeddings = await generate_embeddings(chunks)

    # 4. Store in Supabase document_chunks
    try:
        chunk_rows = []
        for idx, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            chunk_rows.append({
                "document_id": document_id,
                "user_id": user_id,
                "content": chunk,
                "chunk_index": idx,
                "embedding": emb if any(emb) else None,
                "metadata": {"filename": filename, "chunk_index": idx, "total_chunks": len(chunks)},
            })

        # Batch insert chunks
        if chunk_rows:
            # Batch in chunks of 50 to avoid payload limits
            batch_size = 50
            for i in range(0, len(chunk_rows), batch_size):
                batch = chunk_rows[i:i + batch_size]
                supabase.table("document_chunks").insert(batch).execute()

        logger.info(f"Successfully stored {len(chunk_rows)} chunks for document {document_id}")

    except Exception as e:
        logger.error(f"Failed to store chunks in Supabase: {e}")
        # Even if chunk insert fails (e.g. pgvector not enabled), continue gracefully
        pass

    return {
        "status": "indexed",
        "chunks": len(chunks),
        "embeddings_generated": len(embeddings),
    }
