import { NextRequest, NextResponse } from 'next/server';
import { requestChatCompletionJson } from '@/utils/openai';
import { findNewCharacters } from '@/utils/database';
import { CantoneseCharacter } from '@/types';

// Set API route timeout to 2 minutes
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🟡 [CHARACTER API] Request received');

  try {
    const { lyrics, songContext } = await request.json();
    console.log('🟡 [CHARACTER API] Request parsed:', {
      lyricsLength: lyrics?.length || 0,
      hasSongContext: !!songContext,
    });

    if (!lyrics || typeof lyrics !== 'string') {
      console.log('❌ [CHARACTER API] Invalid request: missing or invalid lyrics');
      return NextResponse.json(
        { error: 'Lyrics are required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🟡 [CHARACTER API] Analyzing characters in database...');
    const { newCharacters, foundCharacters } = await findNewCharacters(lyrics);
    console.log('🟡 [CHARACTER API] Database analysis complete:', {
      newCharactersCount: newCharacters.length,
      foundCharactersCount: foundCharacters.length,
    });

    if (newCharacters.length === 0) {
      console.log(`✅ [CHARACTER API] No new characters found, completed in ${Date.now() - startTime}ms`);
      return NextResponse.json({
        newCharacters: [],
        foundCharacters,
        suggestedDefinitions: [],
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ [CHARACTER API] Missing OpenAI API key');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const suggestedDefinitions = await requestChatCompletionJson<CantoneseCharacter[]>({
      timeoutMs: 90000,
      logPrefix: '[CHARACTER API]',
      schemaName: 'character_definitions',
      resultKey: 'characters',
      schema: {
        type: 'object',
        properties: {
          characters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                character: { type: 'string' },
                pronunciation: { type: 'string' },
                definition: { type: 'string' },
              },
              required: ['character', 'pronunciation', 'definition'],
              additionalProperties: false,
            },
          },
        },
        required: ['characters'],
        additionalProperties: false,
      },
      messages: [
        {
          role: 'system',
          content: `You are a Cantonese language expert. Given a set of Chinese characters and their context from song lyrics, provide definitions that best align with the character as used in the song lyrics.

          For each character, provide:
          1. A standard common definition of the character that best matches how it is used in the song. Do not relate directly to song passages.
          2. A reasonable Cantonese pronunciation (romanized). Use the Jyutping romanization system.

          Return one entry per character with:
          - "character": the Chinese character
          - "pronunciation": romanized Cantonese pronunciation
          - "definition": definition that best matches the usage of the character in the song`,
        },
        {
          role: 'user',
          content: `Please provide definitions for these characters found in Cantonese song lyrics:

Characters: ${newCharacters.join(', ')}

Song lyrics context:
${lyrics}

${songContext ? `Additional context: ${songContext}` : ''}`,
        },
      ],
    });

    console.log(`✅ [CHARACTER API] Request completed successfully in ${Date.now() - startTime}ms`);
    return NextResponse.json({
      newCharacters,
      foundCharacters,
      suggestedDefinitions,
    });
  } catch (error: any) {
    console.error(`❌ [CHARACTER API] Error occurred after ${Date.now() - startTime}ms:`, {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Failed to analyze characters: ' + error.message },
      { status: 500 }
    );
  }
}
