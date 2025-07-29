import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Set API route timeout to 2 minutes
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔵 [TRANSLATE API] Request received');
  
  try {
    const { lyrics } = await request.json();
    console.log('🔵 [TRANSLATE API] Request parsed:', {
      lyricsLength: lyrics?.length || 0,
      lyricsPreview: lyrics?.substring(0, 50) + '...'
    });

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

    console.log('🔵 [TRANSLATE API] Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000, // 60 second timeout
    });

    console.log('🔵 [TRANSLATE API] Calling OpenAI API...');
    const openaiStartTime = Date.now();
    
    // Create a heartbeat to show progress
    const heartbeatInterval = setInterval(() => {
      const elapsed = Date.now() - openaiStartTime;
      console.log(`💓 [TRANSLATE API] OpenAI call still in progress... ${Math.round(elapsed/1000)}s elapsed`);
    }, 10000); // Log every 10 seconds
    
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        clearInterval(heartbeatInterval);
        reject(new Error('OpenAI API call timed out after 180 seconds'));
      }, 180000);
    });
    
    const completionPromise = openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
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
          ]`
        },
        {
          role: "user",
          content: `Please translate these Cantonese lyrics:\n\n${lyrics}`
        }
      ],
      temperature: 0.3,
    });

    // Race between the API call and timeout
    const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
    clearInterval(heartbeatInterval);

    const openaiEndTime = Date.now();
    console.log(`🔵 [TRANSLATE API] OpenAI API call completed in ${openaiEndTime - openaiStartTime}ms`);

    const translationContent = completion.choices[0]?.message?.content;
    console.log('🔵 [TRANSLATE API] Raw OpenAI response:', {
      hasContent: !!translationContent,
      contentLength: translationContent?.length || 0,
      contentPreview: translationContent?.substring(0, 200) + '...'
    });
    
    if (!translationContent) {
      console.log('❌ [TRANSLATE API] No content received from OpenAI');
      throw new Error('No translation received from OpenAI');
    }

    // Parse the JSON response
    console.log('🔵 [TRANSLATE API] Parsing JSON response...');
    let translation;
    try {
      translation = JSON.parse(translationContent);
      console.log('✅ [TRANSLATE API] JSON parsed successfully:', {
        translationCount: translation?.length || 0,
        firstItem: translation?.[0]
      });
    } catch (parseError) {
      console.log('⚠️ [TRANSLATE API] Initial JSON parsing failed, trying to extract JSON...');
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = translationContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        translation = JSON.parse(jsonMatch[0]);
        console.log('✅ [TRANSLATE API] JSON extracted and parsed successfully');
      } else {
        console.log('❌ [TRANSLATE API] Could not extract JSON from response');
        throw new Error('Could not parse translation response');
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ [TRANSLATE API] Request completed successfully in ${totalTime}ms`);
    return NextResponse.json({ translation });

  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ [TRANSLATE API] Error occurred after ${totalTime}ms:`, {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to translate lyrics: ' + error.message },
      { status: 500 }
    );
  }
}