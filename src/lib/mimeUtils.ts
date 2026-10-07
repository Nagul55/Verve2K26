/**
 * Utility functions for MIME type detection and file handling.
 */

const MIME_MAP: Record<string, string> = {
  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  rtf: "application/rtf",
  md: "text/markdown",
  
  // Spreadsheets
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  
  // Presentations
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  
  // Images
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  
  // Archives
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  "7z": "application/x-7z-compressed",
  tar: "application/x-tar",
  gz: "application/gzip",
  
  // Code / Data
  json: "application/json",
  xml: "application/xml",
  html: "text/html",
  sql: "application/sql",
};

/**
 * Returns a valid MIME type for a file, resolving from file extension if needed.
 */
export function getMimeType(fileName: string, providedType?: string): string {
  if (providedType && providedType !== "application/octet-stream" && providedType.trim() !== "") {
    return providedType;
  }
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return MIME_MAP[ext] || "application/octet-stream";
}

/**
 * Formats bytes to human-readable size.
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Common list of allowed extensions for event materials and problem statements
 */
export const ALLOWED_FILE_EXTENSIONS = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "csv",
  "png", "jpg", "jpeg", "webp", "gif", "svg",
  "zip", "rar", "7z", "txt", "md"
];

export const ALLOWED_FILE_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.gif,.svg,.zip,.rar,.7z,.txt,.md";
