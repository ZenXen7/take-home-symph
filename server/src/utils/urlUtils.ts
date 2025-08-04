export const generateShortCode = (length = 8): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isExpired = (expirationDate: string | null): boolean => {
  if (!expirationDate) return false;
  return new Date(expirationDate) < new Date();
};

export const buildShortUrl = (shortCode: string): string => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
  return `${baseUrl}/${shortCode}`;
};