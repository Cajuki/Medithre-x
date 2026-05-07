export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim().toLowerCase());

export const normalizeKenyanPhone = (phone) => {
  const cleaned = String(phone || '').replace(/[\s().-]/g, '');

  if (/^\+254[17]\d{8}$/.test(cleaned)) return `0${cleaned.slice(4)}`;
  if (/^254[17]\d{8}$/.test(cleaned)) return `0${cleaned.slice(3)}`;
  if (/^0[17]\d{8}$/.test(cleaned)) return cleaned;

  return cleaned;
};

export const isValidKenyanPhone = (phone) =>
  /^0[17]\d{8}$/.test(normalizeKenyanPhone(phone));

export const KENYAN_PHONE_HINT = 'Use a valid Kenyan number, e.g. 0790 080 903 or +254 790 080 903.';
