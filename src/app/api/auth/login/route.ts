import { NextResponse } from 'next/server';
import { loginUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const user = await loginUser(email, password);
    return NextResponse.json({ user });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unable to login';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


