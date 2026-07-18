#!/usr/bin/env node
// Parses data/Cantonese.txt into data/lyrical.db (sqlite), table `entries`
// with columns: character, jyutping, definition.
//
// The source file is tab-separated ("character\tjyutping definition"), but a
// handful of lines use two literal spaces instead of a tab, and a few entries
// are missing a tone number on the jyutping. This parser is tolerant of both.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const TXT_PATH = path.join(__dirname, '..', 'data', 'Cantonese.txt');
const DB_PATH = path.join(__dirname, '..', 'data', 'lyrical.db');

const JYUTPING_RE = /^([a-zà-ÿ]+)\s?([1-6])\b\s*/i;

function parseLine(line) {
  const chars = Array.from(line);
  if (chars.length === 0) return null;

  const character = chars[0];
  const rest = line.slice(character.length).replace(/^[\t ]+/, '');
  if (!rest) return null;

  const match = rest.match(JYUTPING_RE);
  let jyutping;
  let definition;

  if (match) {
    jyutping = match[1].toLowerCase() + match[2];
    definition = rest.slice(match[0].length).trim();
  } else {
    const parts = rest.split(/\s+/);
    jyutping = parts[0];
    definition = rest.slice(parts[0].length).trim();
  }

  return { character, jyutping, definition };
}

function main() {
  const content = fs.readFileSync(TXT_PATH, 'utf-8');
  const lines = content.split('\n').slice(2); // skip #separator/#html header lines

  const entries = [];
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    if (!line.trim()) continue;
    const parsed = parseLine(line);
    if (parsed && parsed.character && parsed.jyutping) entries.push(parsed);
  }

  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character TEXT NOT NULL,
      jyutping TEXT NOT NULL,
      definition TEXT NOT NULL
    );
    CREATE INDEX idx_entries_character ON entries(character);
  `);

  const insert = db.prepare(
    'INSERT INTO entries (character, jyutping, definition) VALUES (?, ?, ?)'
  );
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row.character, row.jyutping, row.definition);
  });
  insertMany(entries);

  console.log(`Seeded ${entries.length} entries into ${path.relative(process.cwd(), DB_PATH)}`);
  db.close();
}

main();
