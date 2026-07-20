import { NextRequest, NextResponse } from 'next/server';
import { getEntryById, updateEntry } from '@/utils/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid entry id' }, { status: 400 });
  }

  const existing = getEntryById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  const body = await request.json();
  const character = typeof body.character === 'string' ? body.character.trim() : '';
  const jyutping = typeof body.jyutping === 'string' ? body.jyutping.trim() : '';
  const definition = typeof body.definition === 'string' ? body.definition.trim() : '';
  const source = typeof body.source === 'string' ? body.source.trim() || null : null;

  if (!character || !jyutping || !definition) {
    return NextResponse.json(
      { error: 'character, jyutping, and definition are all required' },
      { status: 400 }
    );
  }

  try {
    const updated = updateEntry(id, { character, jyutping, definition, source });
    return NextResponse.json({ entry: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update entry: ' + error.message },
      { status: 500 }
    );
  }
}
