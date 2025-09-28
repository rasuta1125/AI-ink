import OpenAI from 'openai'

// OpenAI クライアント初期化
export function createOpenAIClient(apiKey: string) {
  return new OpenAI({
    apiKey: apiKey,
  })
}

// GPT API呼び出し（厳密JSON schema対応）
export async function callOpenAIJSON(prompt: string, apiKey: string, schema?: any, model = "gpt-4o-mini") {
  const openai = createOpenAIClient(apiKey)
  
  try {
    const requestConfig: any = {
      model: model,
      messages: [
        {
          role: "system",
          content: "あなたは日本語のSNSコピーライターです。必ずJSON形式で回答してください。"
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }

    // JSON schema が指定されている場合は strict mode を使用
    if (schema) {
      requestConfig.response_format = {
        type: "json_schema",
        json_schema: {
          name: "response",
          schema: schema,
          strict: true
        }
      }
    } else {
      // フォールバック: json_object モード
      requestConfig.response_format = { type: "json_object" }
    }

    const response = await openai.chat.completions.create(requestConfig)

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    try {
      return JSON.parse(content)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Content:', content)
      throw new Error('Invalid JSON response from OpenAI')
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw error
  }
}

// リトライ機能付きAPI呼び出し
export async function callOpenAIWithRetry(prompt: string, apiKey: string, schema?: any, model = "gpt-4o-mini", maxRetries = 3) {
  let lastError: Error
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callOpenAIJSON(prompt, apiKey, schema, model)
    } catch (error) {
      lastError = error as Error
      
      // レート制限の場合は指数バックオフ
      if (error instanceof Error && error.message.includes('429')) {
        const delay = Math.pow(2, attempt) * 500 // 0.5s, 1s, 2s
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // その他のエラーは即座にリトライ
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }
  
  throw lastError
}