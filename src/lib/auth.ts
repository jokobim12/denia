import { NextRequest } from 'next/server';

export function isAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const cookieSession = req.cookies.get('admin_session')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (authHeader === `Bearer ${adminPassword}`) return true;
  if (cookieSession === adminPassword) return true;
  return false;
}
