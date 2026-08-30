"""Knowledge base schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    pdf = "pdf"
    docx = "docx"
    txt = "txt"
    md = "md"
    csv = "csv"


class DocumentStatus(str, Enum):
    processing = "processing"
    indexed = "indexed"
    failed = "failed"


class KnowledgeDocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: DocumentType
    status: DocumentStatus
    size: int
    total_chunks: int
    created_at: datetime

    model_config = {"from_attributes": True}


class KnowledgeBaseStats(BaseModel):
    total_documents: int
    total_chunks: int
    indexed_count: int
    processing_count: int


DocumentResponse = KnowledgeDocumentResponse
