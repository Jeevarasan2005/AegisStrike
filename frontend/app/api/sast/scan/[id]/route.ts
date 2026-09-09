import { NextResponse } from 'next/server';
import { getScan } from '../../../store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;
  const scan = getScan(taskId);
  if (!scan) {
    return NextResponse.json({ detail: "Scan not found" }, { status: 404 });
  }
  return NextResponse.json(scan);
}
