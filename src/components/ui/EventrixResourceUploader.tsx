"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  FileArchive, 
  Image as ImageIcon, 
  Presentation, 
  FileCode, 
  File, 
  X, 
  Eye, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  Download,
  Paperclip
} from "lucide-react";
import { uploadEventResourceAction, deleteEventResourceAction, EventResourceItem } from "@/actions/resource.actions";
export type { EventResourceItem };
import { toast } from "sonner";

interface EventrixResourceUploaderProps {
  resources: EventResourceItem[];
  onChange: (resources: EventResourceItem[]) => void;
  subEventId?: string;
  disabled?: boolean;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function getFileIcon(fileName: string, mimeType: string = "") {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || mimeType.startsWith('image/')) {
    return <ImageIcon className="w-5 h-5 text-purple-600" />;
  }
  if (['pdf'].includes(ext)) {
    return <FileText className="w-5 h-5 text-red-600" />;
  }
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return <FileText className="w-5 h-5 text-blue-600" />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return <Presentation className="w-5 h-5 text-amber-600" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <FileArchive className="w-5 h-5 text-indigo-600" />;
  }
  return <File className="w-5 h-5 text-eventrix-muted" />;
}

export function EventrixResourceUploader({
  resources = [],
  onChange,
  subEventId = "draft",
  disabled = false,
}: EventrixResourceUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (disabled || files.length === 0) return;
    setIsUploading(true);

    const uploadedList: EventResourceItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sub_event_id", subEventId);

      const res = await uploadEventResourceAction(formData);
      if (res.success && res.resource) {
        uploadedList.push(res.resource);
        toast.success(`Uploaded: ${file.name}`);
      } else {
        toast.error(res.error || `Failed to upload ${file.name}`);
      }
    }

    if (uploadedList.length > 0) {
      onChange([...resources, ...uploadedList]);
    }
    setIsUploading(false);
  };

  const handleRemove = async (id: string, storagePath: string) => {
    if (disabled) return;
    const updated = resources.filter((r) => r.id !== id);
    onChange(updated);
    toast.info("Resource marked for removal");
    if (storagePath) {
      await deleteEventResourceAction(storagePath);
    }
  };

  const handleReplaceClick = (id: string) => {
    if (disabled) return;
    setReplaceTargetId(id);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTargetId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sub_event_id", subEventId);

    const res = await uploadEventResourceAction(formData);
    if (res.success && res.resource) {
      const targetOld = resources.find((r) => r.id === replaceTargetId);
      if (targetOld?.storage_path) {
        await deleteEventResourceAction(targetOld.storage_path);
      }
      const updated = resources.map((r) => (r.id === replaceTargetId ? res.resource! : r));
      onChange(updated);
      toast.success(`Replaced with: ${file.name}`);
    } else {
      toast.error(res.error || "Failed to replace file.");
    }

    setReplaceTargetId(null);
    setIsUploading(false);
    if (replaceInputRef.current) replaceInputRef.current.value = "";
  };

  return (
    <div className="space-y-4 w-full text-left font-sans">
      {/* Header & Helper Text */}
      <div>
        <label className="text-xs font-extrabold text-eventrix-black uppercase tracking-wider block mb-1 flex items-center gap-1.5">
          <Paperclip className="w-4 h-4 text-eventrix-lavender" /> Event Resources & Attachments
        </label>
        <p className="text-xs text-eventrix-muted leading-relaxed">
          Upload event-related materials such as rules, problem statements, brochures, schedules, guidelines, PPTs, PDFs, documents, spreadsheets, images, or other useful resources for participants.
        </p>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
        disabled={disabled}
      />

      <input
        ref={replaceInputRef}
        type="file"
        className="hidden"
        onChange={handleReplaceFile}
        disabled={disabled}
      />

      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer select-none ${
          dragActive
            ? "border-eventrix-lavender bg-eventrix-lavender/10 shadow-md"
            : "border-[#D9D9DF] hover:border-eventrix-lavender bg-[#F8F8FC] hover:bg-white"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-eventrix-lavender animate-spin" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-black">
              <UploadCloud className="w-6 h-6" />
            </div>
          )}

          <div>
            <p className="text-sm font-bold text-eventrix-black">
              {isUploading ? "Uploading Event Resources..." : "Click or drag & drop files to upload"}
            </p>
            <p className="text-xs text-eventrix-muted mt-0.5">
              PDF • DOCX • PPTX • XLSX • PNG • JPG • ZIP • up to 15MB each
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded File Cards List */}
      {resources.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <p className="text-xs font-bold text-eventrix-black uppercase tracking-wider">
            Uploaded Attachments ({resources.length})
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resources.map((item) => {
              const isImage = item.file_type.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(item.file_name.split('.').pop()?.toLowerCase() || '');

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 bg-white border border-[#D9D9DF] rounded-xl hover:border-eventrix-lavender transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isImage ? (
                      <img
                        src={item.file_url}
                        alt={item.original_name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#D9D9DF] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#F8F8FC] border border-[#D9D9DF] flex items-center justify-center shrink-0">
                        {getFileIcon(item.original_name || item.file_name, item.file_type)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-eventrix-black truncate leading-tight" title={item.original_name}>
                        {item.original_name || item.file_name}
                      </p>
                      <p className="text-[11px] font-semibold text-eventrix-muted uppercase tracking-wider mt-0.5">
                        {item.file_name.split('.').pop()?.toUpperCase() || 'FILE'} • {formatFileSize(item.file_size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View / Preview File"
                      className="p-1.5 text-eventrix-muted hover:text-eventrix-black hover:bg-[#F8F8FC] rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </a>

                    {!disabled && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReplaceClick(item.id)}
                          title="Replace File"
                          className="p-1.5 text-eventrix-muted hover:text-eventrix-black hover:bg-[#F8F8FC] rounded-md transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id, item.storage_path)}
                          title="Remove Attachment"
                          className="p-1.5 text-eventrix-muted hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventrixResourceUploader;
