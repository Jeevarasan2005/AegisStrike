import { NextResponse } from 'next/server';
import { getRules } from '../../store';

export async function GET() {
  return NextResponse.json(getRules());
}
