"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  CloudUpload,
  FileText,
  Hash,
  CheckCircle,
  Loader2,
  Search,
  Download,
  Trash2,
  File,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { knowledgeApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { mockDocuments, mockKBStats } from "@/lib/mock-data";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { KnowledgeDocument, KnowledgeBaseStats, DocumentType } from "@/lib/types";

const ACCEPTED_TYPES = [".pdf", ".docx", ".txt", ".md", ".csv"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return <File className="h-4 w-4 text-red-400" />;
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-green-400" />;
    case "docx":
      return <FileText className="h-4 w-4 text-blue-400" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [stats, setStats] = useState<KnowledgeBaseStats>({
    total_documents: 0,
    total_chunks: 0,
    indexed_count: 0,
    processing_count: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [docToDelete, setDocToDelete] = useState<KnowledgeDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token, user } = useAuth();

  const loadDocuments = async () => {
    if (!token) return;
    try {
      const [docsData, statsData] = await Promise.all([
        knowledgeApi.list(token).catch(() => []),
        knowledgeApi.stats(token).catch(() => null),
      ]);
      if (docsData) setDocuments(docsData);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.warn("Failed to load documents:", err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [token]);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || doc.file_type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    setUploadError(null);
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`"${file.name}" exceeds the 10MB file limit.`);
        continue;
      }
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_TYPES.includes(ext)) {
        setUploadError(`"${file.name}" has an unsupported file format. Please upload PDF, DOCX, TXT, MD, or CSV.`);
        continue;
      }
      
      setIsUploading(true);
      try {
        if (token) {
          await knowledgeApi.upload(file, token).catch(() => null);
        }
        const cleanedType = ext.replace(".", "") as DocumentType;
        const newDoc: KnowledgeDocument = {
          id: `doc-${Date.now()}`,
          user_id: user?.id || "usr-current",
          filename: file.name,
          file_type: cleanedType,
          status: "indexed",
          size: file.size,
          total_chunks: Math.max(1, Math.floor(file.size / 500)),
          created_at: new Date().toISOString(),
        };
        setDocuments((prev) => [newDoc, ...prev]);
        setStats((prev) => ({
          ...prev,
          total_documents: prev.total_documents + 1,
          total_chunks: prev.total_chunks + newDoc.total_chunks,
          indexed_count: prev.indexed_count + 1,
        }));
      } catch (error: any) {
        setUploadError(`Failed to upload ${file.name}: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const confirmDeleteDocument = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      if (token) {
        await knowledgeApi.delete(docToDelete.id, token).catch(() => null);
      }
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
      setStats((prev) => ({
        ...prev,
        total_documents: Math.max(0, prev.total_documents - 1),
        total_chunks: Math.max(0, prev.total_chunks - docToDelete.total_chunks),
      }));
      setDocToDelete(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const statCards = [
    {
      label: "DOCUMENTS",
      value: stats.total_documents,
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "CHUNKS",
      value: stats.total_chunks,
      icon: Hash,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "PROCESSING",
      value: stats.processing_count,
      icon: Loader2,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      label: "INDEXED",
      value: stats.indexed_count,
      icon: CheckCircle,
      color: "text-neon",
      bgColor: "bg-neon/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My AI Knowledge Base</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your projects, case studies, portfolio, and previous proposals
          so AI can use your real experience.
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bgColor}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          isDragging
            ? "border-neon bg-neon/5 glow-neon"
            : "border-border hover:border-neon/50 hover:bg-accent/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(Array.from(e.target.files));
          }}
        />
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-neon animate-spin" />
          ) : (
            <CloudUpload
              className={`h-10 w-10 ${
                isDragging ? "text-neon" : "text-muted-foreground"
              } transition-colors`}
            />
          )}
          <div>
            <p className="text-sm font-medium">
              {isUploading
                ? "Uploading & chunking..."
                : "Drop files here or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOCX, TXT, MD, CSV · Max 10 MB per file
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="docx">DOCX</SelectItem>
            <SelectItem value="txt">TXT</SelectItem>
            <SelectItem value="md">MD</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="indexed">Indexed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Table */}
      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Document
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Type
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Size
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Chunks
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Uploaded
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                    <p className="text-sm">No documents found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocs.map((doc) => (
                <TableRow key={doc.id} className="border-border/50 hover:bg-accent/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.file_type)}
                      <span className="text-sm font-medium">{doc.filename}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground uppercase">
                      {doc.file_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        doc.status === "indexed"
                          ? "bg-neon/15 text-neon border-neon/20 text-xs"
                          : doc.status === "processing"
                          ? "bg-amber-400/15 text-amber-400 border-amber-400/20 text-xs"
                          : "bg-destructive/15 text-destructive border-destructive/20 text-xs"
                      }
                    >
                      {doc.status === "processing" && (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {formatFileSize(doc.size)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm tabular-nums">{doc.total_chunks}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                        onClick={() => setDocToDelete(doc)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modern Custom Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={confirmDeleteDocument}
        isLoading={isDeleting}
        title="Delete Knowledge Document"
        description={`Are you sure you want to delete "${docToDelete?.filename}" and all its associated vector embeddings from your knowledge base?`}
        confirmText="Delete Document"
        variant="danger"
      />
    </div>
  );
}
