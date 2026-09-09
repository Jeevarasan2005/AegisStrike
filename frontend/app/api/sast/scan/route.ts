import { NextResponse } from 'next/server';
import { createScan } from '../../store';
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.json();
  const repo = body.repository || "unknown/repo";
  const taskId = crypto.randomUUID();
  createScan(taskId, repo);
  return NextResponse.json({
    message: "Scan initiated",
    task_id: taskId,
    scan_id: 1
  });
}
