import { NextResponse } from 'next/server';
import { updateRule } from '../../../store';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ruleId = parseInt(params.id, 10);
  const body = await request.json();
  const updated = updateRule(ruleId, body.is_active);
  if (!updated) {
    return NextResponse.json({ detail: "Rule not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
