import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

interface RequestChatCompletionJsonOptions {
  messages: ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  timeoutMs: number;
  heartbeatMs?: number;
  logPrefix: string;
  /** Name for the JSON schema passed to the API (structured outputs). */
  schemaName: string;
  /** JSON schema for the root response object, e.g. { type: 'object', properties: { items: {...} }, required: ['items'], additionalProperties: false }. */
  schema: Record<string, unknown>;
  /** Key within the parsed root object holding the array/value to return. */
  resultKey: string;
}

/**
 * Calls the OpenAI chat completions API using Structured Outputs (strict JSON
 * schema), so the response is guaranteed to match `schema` rather than relying
 * on prompt instructions and tolerant parsing.
 */
export async function requestChatCompletionJson<T>({
  messages,
  model = 'gpt-5.6-terra',
  temperature = 0.3,
  timeoutMs,
  heartbeatMs,
  logPrefix,
  schemaName,
  schema,
  resultKey,
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

  const completionPromise = openai.chat.completions.create({
    model,
    messages,
    temperature,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: schemaName,
        strict: true,
        schema,
      },
    },
  });
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

  const parsed = JSON.parse(content) as Record<string, unknown>;
  return parsed[resultKey] as T;
}
