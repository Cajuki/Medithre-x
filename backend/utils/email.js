import nodemailer from 'nodemailer';
import { createHash } from 'crypto';

export const hashToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

/**
 * Verify a plain token against its stored hash.
 */
export const verifyToken = (plainToken, storedHash) => {
  const hashed = createHash('sha256').update(plainToken).digest('hex');
  return hashed === storedHash;
};
