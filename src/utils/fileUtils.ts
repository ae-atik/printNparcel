// Utility functions for file handling

/**
 * Estimates the number of pages in a document based on file size and type
 * This is a rough estimation - actual page count would require parsing the document
 */
export function estimatePageCount(file: File): number {
  const sizeInKB = file.size / 1024;
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Different estimates based on file type
  if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
    // PDFs: roughly 50-100KB per page depending on content
    return Math.max(1, Math.round(sizeInKB / 75));
  } else if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    // Word documents: roughly 20-40KB per page
    return Math.max(1, Math.round(sizeInKB / 30));
  } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
    // Text files: roughly 2-5KB per page
    return Math.max(1, Math.round(sizeInKB / 3));
  } else if (fileType.includes('image')) {
    // Images: typically 1 page per image
    return 1;
  }
  
  // Default estimation for unknown types
  return Math.max(1, Math.round(sizeInKB / 50));
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if a file type is supported for printing
 */
export function isSupportedFileType(file: File): boolean {
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp'
  ];
  
  const supportedExtensions = [
    '.pdf', '.doc', '.docx', '.txt', '.jpeg', '.jpg', '.png', '.gif', '.bmp'
  ];
  
  return supportedTypes.includes(file.type) || 
         supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}