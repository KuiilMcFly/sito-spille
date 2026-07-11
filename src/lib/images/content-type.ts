const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  heic: "image/heic",
  heif: "image/heif",
  tif: "image/tiff",
  tiff: "image/tiff",
};

export function resolveImageContentType(fileName: string, fileType?: string): string {
  if (fileType && fileType.startsWith("image/")) {
    return fileType;
  }

  const parts = fileName.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  return EXTENSION_CONTENT_TYPES[ext] || "image/jpeg";
}

export function resolveImageExtension(fileName: string, contentType: string): string {
  const parts = fileName.split(".");
  if (parts.length > 1) {
    const ext = parts[parts.length - 1].toLowerCase();
    if (EXTENSION_CONTENT_TYPES[ext]) return ext;
  }

  if (contentType === "image/png") return "png";
  if (contentType === "image/gif") return "gif";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/avif") return "avif";
  if (contentType === "image/svg+xml") return "svg";
  if (contentType === "image/bmp") return "bmp";
  if (contentType === "image/x-icon" || contentType === "image/vnd.microsoft.icon") return "ico";
  if (contentType === "image/heic") return "heic";
  if (contentType === "image/heif") return "heif";
  if (contentType === "image/tiff") return "tiff";
  return "jpg";
}

export const SITE_ASSET_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml,image/bmp,image/x-icon,image/heic,image/heif,image/tiff";

export const SITE_ASSET_MAX_BYTES = 50 * 1024 * 1024;

export function formatSiteAssetMaxSize(): string {
  return "50 MB";
}

export function isAllowedSiteAssetPath(path: string, folder: string): boolean {
  if (!path || path.includes("..")) return false;
  const prefix = folder.endsWith("/") ? folder : folder + "/";
  return path.startsWith(prefix) && path.length > prefix.length;
}

