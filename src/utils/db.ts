import path from 'path';
import Database from 'better-sqlite3';
import { Entry } from '@/types';
import { ENTRIES_DEFAULT_PAGE_SIZE } from '@/utils/constants';

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'lyrical.db');
    db = new Database(dbPath);
  }
  return db;
}

export interface ListEntriesOptions {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListEntriesResult {
  entries: Entry[];
  total: number;
  page: number;
  pageSize: number;
}

export function listEntries({
  search = '',
  page = 1,
  pageSize = ENTRIES_DEFAULT_PAGE_SIZE,
}: ListEntriesOptions = {}): ListEntriesResult {
  const database = getDb();
  const trimmedSearch = search.trim();
  const offset = (page - 1) * pageSize;

  if (trimmedSearch) {
    const like = `%${trimmedSearch}%`;
    const total = database
      .prepare(
        'SELECT COUNT(*) as count FROM entries WHERE character LIKE ? OR jyutping LIKE ? OR definition LIKE ? OR source LIKE ?'
      )
      .get(like, like, like, like) as { count: number };

    const entries = database
      .prepare(
        'SELECT * FROM entries WHERE character LIKE ? OR jyutping LIKE ? OR definition LIKE ? OR source LIKE ? ORDER BY id LIMIT ? OFFSET ?'
      )
      .all(like, like, like, like, pageSize, offset) as Entry[];

    return { entries, total: total.count, page, pageSize };
  }

  const total = database.prepare('SELECT COUNT(*) as count FROM entries').get() as {
    count: number;
  };
  const entries = database
    .prepare('SELECT * FROM entries ORDER BY id LIMIT ? OFFSET ?')
    .all(pageSize, offset) as Entry[];

  return { entries, total: total.count, page, pageSize };
}

export function getAllEntries(): Entry[] {
  const database = getDb();
  return database.prepare('SELECT * FROM entries ORDER BY id').all() as Entry[];
}

export function getEntryById(id: number): Entry | undefined {
  const database = getDb();
  return database.prepare('SELECT * FROM entries WHERE id = ?').get(id) as Entry | undefined;
}

export function updateEntry(id: number, fields: Omit<Entry, 'id'>): Entry | undefined {
  const database = getDb();
  const { character, jyutping, definition, source } = fields;
  database
    .prepare('UPDATE entries SET character = ?, jyutping = ?, definition = ?, source = ? WHERE id = ?')
    .run(character, jyutping, definition, source, id);
  return getEntryById(id);
}

export function findEntriesByCharacter(character: string): Entry[] {
  const database = getDb();
  return database
    .prepare('SELECT * FROM entries WHERE character = ? ORDER BY id')
    .all(character) as Entry[];
}

export function insertEntries(entries: Omit<Entry, 'id'>[]): Entry[] {
  const database = getDb();
  const insert = database.prepare(
    'INSERT INTO entries (character, jyutping, definition, source) VALUES (?, ?, ?, ?)'
  );
  const insertMany = database.transaction((rows: Omit<Entry, 'id'>[]) => {
    return rows.map((row) => insert.run(row.character, row.jyutping, row.definition, row.source)
      .lastInsertRowid as number);
  });
  const ids = insertMany(entries);
  return ids.map((id) => getEntryById(id)!);
}

export function deleteEntriesBySource(source: string): number {
  const database = getDb();
  const info = database.prepare('DELETE FROM entries WHERE source = ?').run(source);
  return info.changes;
}

export function listSources(): string[] {
  const database = getDb();
  const rows = database
    .prepare(
      "SELECT DISTINCT source FROM entries WHERE source IS NOT NULL AND source != '' ORDER BY source"
    )
    .all() as { source: string }[];
  return rows.map((r) => r.source);
}
