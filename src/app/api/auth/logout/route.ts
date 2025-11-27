import { NextResponse } from 'next/server';
import { logoutUser } from '../../../../lib/auth';

export async function POST() {
  logoutUser();
  return NextResponse.json({ success: true });
}


