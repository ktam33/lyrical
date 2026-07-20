# Cantonese Lyrics Translator

A web application that provides contextual translation of Cantonese song lyrics, identifies new characters for dictionary expansion, and lets you browse and edit the underlying character dictionary.

## Features

### 🎵 **Contextual Translation**
- Translates Cantonese lyrics using OpenAI GPT-4
- Focuses on capturing the overall meaning and emotional essence rather than literal word-for-word translation
- Displays original and translated lines in an interleaved format
- Translator state (lyrics input, translation, character analysis) persists as you navigate to the dictionary and back

### 📚 **Character Dictionary**
- Character data lives in a SQLite database (`data/lyrical.db`), table `entries(id, character, jyutping, definition, source)`
- Seeded from `data/Cantonese_Anki.txt` (an Anki deck export) via `npm run seed-db`
- Automatically compares input lyrics against the dictionary to find known characters

### 🔍 **New Character Discovery**
- Identifies characters not present in the current dictionary
- Generates contextually appropriate definitions and Jyutping for new characters via GPT-4
- Definitions are tailored to align with the song's theme and context

### ✏️ **Browse & Edit Dictionary**
- Dedicated `/entries` page lists all dictionary entries with search and pagination
- Inline editing of character, Jyutping, definition, and source for any entry, saved directly to the database

## Tech Stack

- **Frontend**: React with Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT-4.1 API
- **Database**: SQLite via `better-sqlite3`
- **State**: React Context (`TranslatorContext`) to share translator state across routes

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **(Optional) Rebuild the dictionary database from source:**
   ```bash
   npm run seed-db
   ```
   `data/lyrical.db` is checked into the repo already seeded, so this is only needed if you've edited `data/Cantonese_Anki.txt` and want to regenerate the database from scratch (this overwrites `data/lyrical.db`, including any edits made through the `/entries` page).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### Translating lyrics
1. **Input**: Paste Cantonese song lyrics into the text area
2. **Translate**: Click "Translate Lyrics" to get contextual English translation
3. **Analyze**: Review the character analysis showing:
   - Interleaved original and translated lines
   - List of new characters not in the dictionary
   - Suggested definitions for new characters
4. **Expand**: Add new characters to the dictionary via the `/entries` page

### Browsing/editing the dictionary
1. Click "Browse dictionary entries" from the home page, or navigate to `/entries`
2. Search by character, Jyutping, or definition, and page through results
3. Click "Edit" on any row to update its character, Jyutping, definition, or source, then "Save"

## Project Structure

```
├── data/
│   ├── Cantonese_Anki.txt     # Source Anki deck export (character, jyutping, definition, source)
│   ├── Cantonese.txt          # Legacy flat-file dictionary (superseded by lyrical.db)
│   └── lyrical.db             # SQLite database (table: entries)
├── scripts/
│   └── seed-db.js             # Parses Cantonese_Anki.txt into lyrical.db
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── translate/         # Translation API endpoint
│   │   │   ├── analyze-characters/ # Character analysis API endpoint
│   │   │   └── entries/           # Dictionary list/search + update-by-id endpoints
│   │   ├── entries/page.tsx   # Dictionary browse/edit page
│   │   ├── page.tsx           # Main translator page
│   │   └── layout.tsx         # Root layout (wraps app in TranslatorProvider)
│   ├── components/            # React components (LyricsInput, TranslationDisplay, EntriesBrowser, ...)
│   ├── context/
│   │   └── TranslatorContext.tsx # Shared translator state across routes
│   ├── types/                 # Shared TypeScript interfaces (CantoneseCharacter, Entry, ...)
│   └── utils/
│       ├── db.ts               # SQLite access layer (list/search/update entries)
│       ├── database.ts         # In-memory character lookup used by the translator, backed by db.ts
│       ├── openai.ts           # Shared OpenAI chat-completion + JSON-parsing helper
│       └── constants.ts        # Shared constants (e.g. page sizes)
├── package.json
└── README.md
```

## Dictionary Database

`data/lyrical.db` is a SQLite database with a single table:

```sql
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character TEXT NOT NULL,
  jyutping TEXT NOT NULL,
  definition TEXT NOT NULL,
  source TEXT
);
```

It's generated by `npm run seed-db` from `data/Cantonese_Anki.txt`, an Anki deck export where each line looks like:

```
Cantonese::<song source>	<character>	<jyutping + definition>
```

e.g. `Cantonese::姜濤 - Dear My Friend	姜	goeng 1 ginger`. The seed script tolerates a few quirks in the source file (missing tone numbers, extra blank fields, double-space separators instead of tabs) and skips exact duplicate `(character, jyutping, definition)` rows.

## Contributing

1. Ensure your OpenAI API key is configured
2. Test translations with various Cantonese lyrics
3. Review suggested character definitions for accuracy
4. Add or correct dictionary entries via the `/entries` page (or by editing `data/Cantonese_Anki.txt` and re-running `npm run seed-db`)

## License

This project is for educational and research purposes.
