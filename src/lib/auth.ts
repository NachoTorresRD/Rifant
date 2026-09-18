import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'rifant_admin_token';
const ADMIN_EMAIL_COOKIE = 'rifant_admin_email';
const TOKEN_VALUE = 'authenticated_rifant_admin_session_valid';

const DEFAULT_ALLOWED_EMAILS = [
  'admin@ejemplo.com',
];

export function getAllowedEmails(): string[] {
  if (process.env.ADMIN_EMAILS) {
    const list = process.env.ADMIN_EMAILS.split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return DEFAULT_ALLOWED_EMAILS;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'admin12345';
}

export function validateAdminCredentials(
  email: string,
  password: string
): { valid: boolean; email?: string; error?: string } {
  if (!email || !password) {
    return { valid: false, error: 'Debes ingresar correo y contraseña' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowed = getAllowedEmails();

  if (!allowed.includes(normalizedEmail)) {
    return {
      valid: false,
      error: 'Correo no autorizado. Acceso restringido únicamente a administradores.',
    };
  }

  if (password.trim() !== getAdminPassword()) {
    return { valid: false, error: 'Contraseña incorrecta' };
  }

  return { valid: true, email: normalizedEmail };
}

export async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token === TOKEN_VALUE;
}

export async function getAdminSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (token !== TOKEN_VALUE) return null;
  return cookieStore.get(ADMIN_EMAIL_COOKIE)?.value || null;
}

export async function setAdminSession(email: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, TOKEN_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  cookieStore.set(ADMIN_EMAIL_COOKIE, email.trim().toLowerCase(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.delete(ADMIN_EMAIL_COOKIE);
}

// Deprecated single-param helper for backward compatibility
export function checkPassword(password: string): boolean {
  return password.trim() === getAdminPassword();
}
