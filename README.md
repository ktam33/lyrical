# Cantonese Lyrics Translator

A web application that provides contextual translation of Cantonese song lyrics and identifies new characters for dictionary expansion.

## Features

### 🎵 **Contextual Translation**
- Translates Cantonese lyrics using OpenAI GPT-4
- Focuses on capturing the overall meaning and emotional essence rather than literal word-for-word translation
- Displays original and translated lines in an interleaved format

### 📚 **Character Database Integration**
- Maintains a comprehensive database of Cantonese characters (`data/Cantonese.txt`)
- Database format: tab-separated file with character, pronunciation, and definition
- Automatically compares input lyrics against existing character database

### 🔍 **New Character Discovery**
- Identifies characters not present in the current database
- Generates contextually appropriate definitions for new characters
- Provides copy-ready output for easy database expansion
- Definitions are tailored to align with the song's theme and context

## Tech Stack

- **Frontend**: React with Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT-4 API
- **Database**: Text file (tab-separated format)

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

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

1. **Input**: Paste Cantonese song lyrics into the text area
2. **Translate**: Click "Translate Lyrics" to get contextual English translation
3. **Analyze**: Review the character analysis showing:
   - Interleaved original and translated lines
   - List of new characters not in the database
   - Suggested definitions for new characters
4. **Expand**: Copy the suggested character definitions to add to your database

## Project Structure

```
├── data/
│   └── Cantonese.txt          # Character database
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── translate/     # Translation API endpoint
│   │   │   └── analyze-characters/ # Character analysis API
│   │   ├── page.tsx           # Main application page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   ├── types/                 # TypeScript interfaces
│   └── utils/
│       └── database.ts        # Database utility functions
├── package.json
└── README.md
```

## Character Database Format

The `data/Cantonese.txt` file uses this format:
```
#separator:tab
#html:false
字    pronunciation definition
愛    oi3 love; affection
心    sam1 heart; mind; feelings
```

## Contributing

1. Ensure your OpenAI API key is configured
2. Test translations with various Cantonese lyrics
3. Review suggested character definitions for accuracy
4. Add new characters to the database as needed

## License

This project is for educational and research purposes.