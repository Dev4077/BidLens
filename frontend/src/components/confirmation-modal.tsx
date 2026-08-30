"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, HelpCircle, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return <HelpCircle className="h-5 w-5 text-primary" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "danger":
        return "bg-destructive/15 border-destructive/30";
      case "warning":
        return "bg-amber-500/15 border-amber-500/30";
      default:
        return "bg-primary/15 border-primary/30";
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-destructive hover:bg-destructive/90 text-white shadow-md shadow-destructive/20";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-md shadow-amber-500/20";
      default:
        return "bg-primary hover:opacity-90 text-white font-semibold shadow-md shadow-primary/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <Card className="relative z-10 w-full max-w-md border border-border/80 bg-card shadow-2xl rounded-2xl overflow-visible animate-in fade-in-0 zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-3 pt-6 px-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${getIconBg()}`}
            >
              {getIcon()}
            </div>
            <div className="space-y-1 pr-4">
              <CardTitle className="text-base font-bold text-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-6 px-6">
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer text-xs h-9 px-4 border-border text-foreground hover:bg-accent"
            >
              {cancelText}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onConfirm}
              disabled={isLoading}
              className={`cursor-pointer text-xs h-9 px-4 gap-1.5 ${getConfirmButtonClass()}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
