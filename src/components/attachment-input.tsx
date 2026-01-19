"use client";

import { Input, Label, Button } from "@valoro/ui";
import { IconPaperclip } from "@tabler/icons-react";

interface AttachmentInputProps {
  value: File | string | null;
  onChange: (file: File | null) => void;
  id?: string;
  label?: string;
}

export function AttachmentInput({
  value,
  onChange,
  id = "anexo",
  label = "Anexo (Recibo/Documento)",
}: AttachmentInputProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        accept="image/*,application/pdf"
        className="cursor-pointer text-muted-foreground file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onChange(file);
        }}
      />
      {value && (
        <div className="flex flex-col gap-1">
          {value instanceof File && (
            <p className="text-xs text-muted-foreground">
              Novo arquivo: <span className="font-medium">{value.name}</span>
            </p>
          )}

          {typeof value === "string" && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto w-fit p-0 text-xs text-primary gap-1 decoration-auto"
              onClick={() => {
                try {
                  if (!value.startsWith("data:")) {
                    console.error("Formato de anexo inválido");
                    return;
                  }
                  // Convert Base64 data URI to Blob
                  const arr = value.split(",");
                  const mimeMatch = arr[0].match(/:(.*?);/);
                  const mime = mimeMatch
                    ? mimeMatch[1]
                    : "application/octet-stream";
                  const bstr = atob(arr[1]);
                  let n = bstr.length;
                  const u8arr = new Uint8Array(n);
                  while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                  }
                  const blob = new Blob([u8arr], { type: mime });
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                } catch (e) {
                  console.error("Erro ao abrir anexo:", e);
                }
              }}
            >
              <IconPaperclip className="h-3 w-3" />
              Visualizar anexo atual
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
