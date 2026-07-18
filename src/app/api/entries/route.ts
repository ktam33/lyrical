import { NextRequest, NextResponse } from 'next/server';
import { deleteEntriesBySource, insertEntries, listEntries } from '@/utils/db';
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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const rawEntries = Array.isArray(body.entries) ? body.entries : null;

  if (!rawEntries || rawEntries.length === 0) {
    return NextResponse.json({ error: 'entries must be a non-empty array' }, { status: 400 });
  }

  const entries = [];
  for (const raw of rawEntries) {
    const character = typeof raw.character === 'string' ? raw.character.trim() : '';
    const jyutping = typeof raw.jyutping === 'string' ? raw.jyutping.trim() : '';
    const definition = typeof raw.definition === 'string' ? raw.definition.trim() : '';
    const source = typeof raw.source === 'string' ? raw.source.trim() || null : null;

    if (!character || !jyutping || !definition) {
      return NextResponse.json(
        { error: 'character, jyutping, and definition are all required for every entry' },
        { status: 400 }
      );
    }
    entries.push({ character, jyutping, definition, source });
  }

  try {
    const inserted = insertEntries(entries);
    return NextResponse.json({ entries: inserted }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to insert entries: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = (searchParams.get('source') || '').trim();

  if (!source) {
    return NextResponse.json({ error: 'source is required' }, { status: 400 });
  }

  try {
    const deleted = deleteEntriesBySource(source);
    return NextResponse.json({ deleted });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete entries: ' + error.message },
      { status: 500 }
    );
  }
}
