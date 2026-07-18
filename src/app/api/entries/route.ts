import { NextRequest, NextResponse } from 'next/server';
import { listEntries } from '@/utils/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(
    200,
    Math.max(1, parseInt(searchParams.get('pageSize') || '50', 10) || 50)
  );

  try {
    const result = listEntries({ search, page, pageSize });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to list entries: ' + error.message },
      { status: 500 }
    );
  }
}
