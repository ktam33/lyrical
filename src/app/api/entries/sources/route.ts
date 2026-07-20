import { NextResponse } from 'next/server';
import { listSources } from '@/utils/db';

export async function GET() {
  try {
    const sources = listSources();
    return NextResponse.json({ sources });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to list sources: ' + error.message },
      { status: 500 }
    );
  }
}
