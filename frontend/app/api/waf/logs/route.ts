import { NextResponse } from 'next/server';
import { getLogs } from '../../store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  return NextResponse.json(getLogs(limit));
}
