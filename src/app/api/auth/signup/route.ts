import { NextResponse } from 'next/server';
import { registerUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const user = await registerUser(name, email, password);
    return NextResponse.json({ user });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unable to create account';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


