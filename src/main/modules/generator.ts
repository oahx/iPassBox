import * as crypto from 'crypto';
import type { GenOptions } from '../../shared/types';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR = '0OlI1';

export function generatePassword(options: GenOptions): string {
  let chars = '';
  
  if (options.uppercase) chars += UPPERCASE;
  if (options.lowercase) chars += LOWERCASE;
  if (options.numbers) chars += NUMBERS;
  if (options.symbols) chars += SYMBOLS;
  
  if (chars === '') {
    chars = LOWERCASE + NUMBERS;
  }
  
  if (options.excludeSimilar) {
    chars = chars.split('').filter(c => !SIMILAR.includes(c)).join('');
  }
  
  const randomBytes = crypto.randomBytes(options.length);
  let password = '';
  
  for (let i = 0; i < options.length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  
  return password;
}

export function calculateStrength(password: string): number {
  if (!password) return 0;
  
  let score = 0;
  
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;
  
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 15;
  
  if (/(.)\1{2,}/.test(password)) score -= 10;
  if (/^[a-zA-Z]+$/.test(password)) score -= 10;
  if (/^[0-9]+$/.test(password)) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}
