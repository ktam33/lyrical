import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

interface RequestChatCompletionJsonOptions {
  messages: ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  timeoutMs: number;
  heartbeatMs?: number;
  logPrefix: string;
}

/**
 * Calls the OpenAI chat completions API expecting a JSON array response,
 * with a timeout race and tolerant parsing (some models wrap the JSON in
 * prose despite being asked not to).
 */
export async function requestChatCompletionJson<T>({
  messages,
  model = 'gpt-4.1',
  temperature = 0.3,
  timeoutMs,
  heartbeatMs,
  logPrefix,
}: RequestChatCompletionJsonOptions): Promise<T> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
  });

  const startTime = Date.now();
  let heartbeatInterval: ReturnType<typeof setInterval> | undefined;
  if (heartbeatMs) {
    heartbeatInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`💓 ${logPrefix} OpenAI call still in progress... ${elapsed}s elapsed`);
    }, heartbeatMs);
  }

  const completionPromise = openai.chat.completions.create({ model, messages, temperature });
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`OpenAI API call timed out after ${Math.round(timeoutMs / 1000)} seconds`));
    }, timeoutMs);
  });

  let completion;
  try {
    completion = (await Promise.race([completionPromise, timeoutPromise])) as Awaited<
      typeof completionPromise
    >;
  } finally {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
  }

  console.log(`✅ ${logPrefix} OpenAI API call completed in ${Date.now() - startTime}ms`);

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  return parseJsonFromContent<T>(content);
}

function parseJsonFromContent<T>(content: string): T {
  try {
    return JSON.parse(content) as T;
  } catch {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error('Could not parse OpenAI response as JSON');
  }
}
