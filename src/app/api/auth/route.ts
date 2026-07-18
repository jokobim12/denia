import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookieSession = req.cookies.get('admin_session')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (cookieSession === adminPassword) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_session', adminPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// Tambahkan logout jika diperlukan
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
