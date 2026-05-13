const API_URL = import.meta.env.VITE_API_URL || '';

const getApiOrigin = () => {
  if (!API_URL) return '';

  try {
    return new URL(API_URL, window.location.origin).origin;
  } catch {
    return '';
  }
};

export const resolveAssetUrl = (value) => {
  if (!value) return value;

  if (value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  const uploadsIndex = value.indexOf('/uploads/');
  if (uploadsIndex >= 0) {
    const uploadPath = value.slice(uploadsIndex);
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}${uploadPath}` : uploadPath;
  }

  return value;
};
