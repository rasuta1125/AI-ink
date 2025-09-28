import OpenAI from 'openai'

// JSON Schema definitions for strict mode
export const HookSchema = {
  type: "object",
  properties: {
    hooks: {
      type: "array",
      items: { type: "string" },
      minItems: 5,
      maxItems: 5
    }
  },
  required: ["hooks"],
  additionalProperties: false
}

export const CTASchema = {
  type: "object", 
  properties: {
    ctas: {
      type: "array",
      items: { type: "string" },
      minItems: 5,
      maxItems: 5
    }
  },
  required: ["ctas"],
  additionalProperties: false
}

export const HashtagSchema = {
  type: "object",
  properties: {
    hashtags: {
      type: "array", 
      items: { type: "string" },
      minItems: 6,
      maxItems: 6
    }
  },
  required: ["hashtags"],
  additionalProperties: false
}

export const CaptionSchema = {
  type: "object",
  properties: {
    captions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          parts: {
            type: "object",
            properties: {
              hook: { type: "string" },
              body: { type: "string" },
              cta: { type: "string" },
              hashtags: {
                type: "array",
                items: { type: "string" },
                minItems: 6,
                maxItems: 6
              }
            },
            required: ["hook", "body", "cta", "hashtags"],
            additionalProperties: false
          }
        },
        required: ["text", "parts"],
        additionalProperties: false
      },
      minItems: 3,
      maxItems: 3
    }
  },
  required: ["captions"],
  additionalProperties: false
}

// OpenAI API呼び出し（厳密JSON schema対応）
export async function callOpenAI(prompt: string, apiKey: string, schema: any) {
  const openai = new OpenAI({ apiKey })
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは日本語のSNSコピーライターです。必ず指定されたJSON形式で回答してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "response",
          schema: schema,
          strict: true
        }
      },
      temperature: 0.7,
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw error
  }
}

// リトライ機能付きAPI呼び出し
export async function callOpenAIWithRetry(prompt: string, apiKey: string, schema: any, maxRetries = 2) {
  let lastError: Error
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callOpenAI(prompt, apiKey, schema)
    } catch (error) {
      lastError = error as Error
      
      // レート制限の場合は待機
      if (error instanceof Error && error.message.includes('429')) {
        const delay = Math.pow(2, attempt) * 1000 // 1s, 2s
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // その他のエラーは短時間待機してリトライ
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
  }
  
  throw lastError
}