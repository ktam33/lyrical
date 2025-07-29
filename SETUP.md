# Cantonese Lyrics Translator - Setup Instructions

## Prerequisites
- Node.js 18+ installed
- OpenAI API key

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

1. Paste Cantonese song lyrics into the text area
2. Click "Translate Lyrics" to get:
   - Line-by-line contextual translation
   - Analysis of new characters not in the database
   - Suggested definitions for new characters

## Features

- **Contextual Translation**: Uses GPT-4 to provide meaningful translations that capture the song's essence rather than literal word-for-word translation
- **Character Database**: Compares lyrics against existing Cantonese character database
- **New Character Detection**: Identifies characters not in the database
- **Contextual Definitions**: Generates appropriate definitions for new characters based on the song's context
- **Copy-friendly Output**: Provides formatted text that can be easily added to the character database

## File Structure

- `/Cantonese.txt` - Character database (tab-separated: character, pronunciation, definition)
- `/src/app/api/translate/` - Translation API endpoint
- `/src/app/api/analyze-characters/` - Character analysis API endpoint
- `/src/components/` - React components
- `/src/utils/database.ts` - Database utility functions