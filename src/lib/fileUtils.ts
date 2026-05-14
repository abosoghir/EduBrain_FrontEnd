/**
 * Resolves a content URL for course materials.
 * - If the URL is already absolute (http/https), returns it as-is (external link).
 * - If relative (e.g. "materials/abc.pdf"), prepends the backend base URL.
 */

const BACKEND_BASE_URL = 'https://edu-brain-v1.runasp.net';

export function resolveFileUrl(contentUrl: string | null | undefined): string {
  if (!contentUrl) return '';
  if (contentUrl.startsWith('http://') || contentUrl.startsWith('https://')) {
    return contentUrl;
  }
  // Ensure no double slash
  const path = contentUrl.startsWith('/') ? contentUrl : `/${contentUrl}`;
  return `${BACKEND_BASE_URL}${path}`;
}

/**
 * Returns true if the file can be previewed inline in the browser
 * (PDFs, images, common text files).
 */
export function isPreviewable(contentUrl: string | null | undefined): boolean {
  if (!contentUrl) return false;
  const ext = contentUrl.split('.').pop()?.toLowerCase() ?? '';
  return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'txt'].includes(ext);
}

/**
 * Returns true if the URL is an external link (not a backend-hosted file).
 */
export function isExternalLink(contentUrl: string | null | undefined): boolean {
  if (!contentUrl) return false;
  return contentUrl.startsWith('http://') || contentUrl.startsWith('https://');
}

/**
 * Triggers a browser download for the given URL.
 */
export function downloadFile(contentUrl: string | null | undefined, fileName?: string) {
  if (!contentUrl) return;
  const resolved = resolveFileUrl(contentUrl);
  const a = document.createElement('a');
  a.href = resolved;
  a.download = fileName || contentUrl.split('/').pop() || 'download';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
