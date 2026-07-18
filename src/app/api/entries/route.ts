import { NextRequest, NextResponse } from 'next/server';
import { listEntries } from '@/utils/db';
import { ENTRIES_DEFAULT_PAGE_SIZE, ENTRIES_MAX_PAGE_SIZE } from '@/utils/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(
    ENTRIES_MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get('pageSize') || String(ENTRIES_DEFAULT_PAGE_SIZE), 10) || ENTRIES_DEFAULT_PAGE_SIZE)
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
