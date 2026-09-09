import { NextResponse } from 'next/server';
import { getStats } from '../../store';

export async function GET() {
  return NextResponse.json(getStats());
}
