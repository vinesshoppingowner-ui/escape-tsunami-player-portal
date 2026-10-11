// Generate a URL-safe slug from a title
export function generateSlug(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'application';
}

// Check if a string looks like a MongoDB ObjectId (24 hex chars)
export function isObjectId(str) {
  return /^[a-f0-9]{24}$/i.test(str || '');
}