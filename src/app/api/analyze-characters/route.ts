import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
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
      hasSongContext: !!songContext
    });

    if (!lyrics || typeof lyrics !== 'string') {
      console.log('❌ [CHARACTER API] Invalid request: missing or invalid lyrics');
      return NextResponse.json(
        { error: 'Lyrics are required and must be a string' },
        { status: 400 }
      );
    }

    // Find new characters not in the database
    console.log('🟡 [CHARACTER API] Analyzing characters in database...');
    const dbStartTime = Date.now();
    const { newCharacters, foundCharacters } = await findNewCharacters(lyrics);
    const dbEndTime = Date.now();
    
    console.log(`🟡 [CHARACTER API] Database analysis completed in ${dbEndTime - dbStartTime}ms:`, {
      newCharactersCount: newCharacters.length,
      foundCharactersCount: foundCharacters.length,
      newCharacters: newCharacters.slice(0, 10) // Show first 10 characters
    });

    if (newCharacters.length === 0) {
      const totalTime = Date.now() - startTime;
      console.log(`✅ [CHARACTER API] No new characters found, completed in ${totalTime}ms`);
      return NextResponse.json({
        newCharacters: [],
        foundCharacters,
        suggestedDefinitions: []
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ [CHARACTER API] Missing OpenAI API key');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    console.log('🟡 [CHARACTER API] Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000, // 60 second timeout
    });

    // Generate contextual definitions for new characters
    console.log('🟡 [CHARACTER API] Calling OpenAI for character definitions...');
    const openaiStartTime = Date.now();
    
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('OpenAI API call timed out after 90 seconds'));
      }, 90000);
    });
    
    const completionPromise = openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Cantonese language expert. Given a set of Chinese characters and their context from song lyrics, provide definitions that best align with the song's meaning.
          
          For each character, provide:
          1. A contextually appropriate definition that fits the song's theme
          2. A reasonable Cantonese pronunciation (romanized)
          
          Return the result as a JSON array where each object has:
          - "character": the Chinese character
          - "pronunciation": romanized Cantonese pronunciation  
          - "definition": contextually appropriate definition
          
          Example format:
          [
            {"character": "愛", "pronunciation": "oi3", "definition": "love; affection"},
            {"character": "心", "pronunciation": "sam1", "definition": "heart; mind; feelings"}
          ]`
        },
        {
          role: "user",
          content: `Please provide definitions for these characters found in Cantonese song lyrics:
          
Characters: ${newCharacters.join(', ')}

Song lyrics context:
${lyrics}

${songContext ? `Additional context: ${songContext}` : ''}`
        }
      ],
      temperature: 0.3,
    });

    // Race between the API call and timeout
    const completion = await Promise.race([completionPromise, timeoutPromise]) as any;

    const openaiEndTime = Date.now();
    console.log(`🟡 [CHARACTER API] OpenAI API call completed in ${openaiEndTime - openaiStartTime}ms`);

    const definitionContent = completion.choices[0]?.message?.content;
    console.log('🟡 [CHARACTER API] Raw OpenAI response:', {
      hasContent: !!definitionContent,
      contentLength: definitionContent?.length || 0,
      contentPreview: definitionContent?.substring(0, 200) + '...'
    });
    
    if (!definitionContent) {
      console.log('❌ [CHARACTER API] No content received from OpenAI');
      throw new Error('No definitions received from OpenAI');
    }

    // Parse the JSON response
    console.log('🟡 [CHARACTER API] Parsing JSON response...');
    let suggestedDefinitions: CantoneseCharacter[];
    try {
      suggestedDefinitions = JSON.parse(definitionContent);
      console.log('✅ [CHARACTER API] JSON parsed successfully:', {
        definitionsCount: suggestedDefinitions?.length || 0,
        firstDefinition: suggestedDefinitions?.[0]
      });
    } catch (parseError) {
      console.log('⚠️ [CHARACTER API] Initial JSON parsing failed, trying to extract JSON...');
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = definitionContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestedDefinitions = JSON.parse(jsonMatch[0]);
        console.log('✅ [CHARACTER API] JSON extracted and parsed successfully');
      } else {
        console.log('❌ [CHARACTER API] Could not extract JSON from response');
        throw new Error('Could not parse definitions response');
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ [CHARACTER API] Request completed successfully in ${totalTime}ms`);
    return NextResponse.json({
      newCharacters,
      foundCharacters,
      suggestedDefinitions
    });

  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ [CHARACTER API] Error occurred after ${totalTime}ms:`, {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to analyze characters: ' + error.message },
      { status: 500 }
    );
  }
}