import { NextRequest, NextResponse } from 'next/server';
import { requestChatCompletionJson } from '@/utils/openai';
import { TranslationResult } from '@/types';

// Set API route timeout to 2 minutes
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔵 [TRANSLATE API] Request received');

  try {
    const { lyrics } = await request.json();
    console.log('🔵 [TRANSLATE API] Request parsed:', { lyricsLength: lyrics?.length || 0 });

    if (!lyrics || typeof lyrics !== 'string') {
      console.log('❌ [TRANSLATE API] Invalid request: missing or invalid lyrics');
      return NextResponse.json(
        { error: 'Lyrics are required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ [TRANSLATE API] Missing OpenAI API key');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const translation = await requestChatCompletionJson<TranslationResult[]>({
      timeoutMs: 180000,
      heartbeatMs: 10000,
      logPrefix: '[TRANSLATE API]',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in Cantonese to English translation.
          Your task is to translate Cantonese song lyrics in a way that captures the overall meaning and emotional essence of the song rather than providing literal word-for-word translations.

          Please:
          1. Translate each line preserving the poetic and emotional meaning
          2. Consider the context of the entire song when translating each line
          3. Use natural English that flows well and maintains the song's sentiment
          4. Return the translation as a JSON array where each object has "originalLine" and "translatedLine" properties

          Example format:
          [
            {"originalLine": "原文第一行", "translatedLine": "English translation of first line"},
            {"originalLine": "原文第二行", "translatedLine": "English translation of second line"}
          ]`,
        },
        {
          role: 'user',
          content: `Please translate these Cantonese lyrics:\n\n${lyrics}`,
        },
      ],
    });

    console.log(`✅ [TRANSLATE API] Request completed successfully in ${Date.now() - startTime}ms`);
    return NextResponse.json({ translation });
  } catch (error: any) {
    console.error(`❌ [TRANSLATE API] Error occurred after ${Date.now() - startTime}ms:`, {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Failed to translate lyrics: ' + error.message },
      { status: 500 }
    );
  }
}
