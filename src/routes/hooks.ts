import { Hono } from 'hono'
import { HookRequestSchema, HookResponseSchema, hasForbiddenWords } from '../lib/schemas'
import { callOpenAIWithRetry } from '../lib/openai'
import { getFallbackHooks } from '../lib/fallbacks'

export const hookRoutes = new Hono<{
  Bindings: {
    OPENAI_API_KEY: string
  }
}>()

hookRoutes.post('/', async (c) => {
  try {
    // リクエストボディの検証
    const body = await c.req.json()
    const validatedInput = HookRequestSchema.parse(body)
    const { goal, industry, tone, topic } = validatedInput

    // OpenAI API Key の取得
    const apiKey = c.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OpenAI API key not found, using fallback')
      return c.json({
        hooks: getFallbackHooks(industry, topic),
        meta: {
          source: 'fallback',
          goal, industry, tone, topic
        }
      })
    }

    // プロンプト作成
    const prompt = `
あなたはSNSコピーライター。日本語で回答し、結果をJSON形式で出力してください。
目的:${goal} 業種:${industry} トーン:${tone} トピック:${topic}

要件:
- Hookを5つ。系統は[数字,質問,逆説,ギャップ,事実]を各1つ。
- 24〜48字。語尾の連続と同義反復は避ける。
- 誇大表現や断定的効果保証は使わない。
- トーンに応じた自然な日本語で。

JSON出力形式: {"hooks":["h1","h2","h3","h4","h5"]}
    `.trim()

    try {
      // OpenAI API 呼び出し
      const result = await callOpenAIWithRetry(prompt, apiKey)
      
      // 出力検証
      const validatedOutput = HookResponseSchema.parse(result)
      
      // 禁止語チェック
      const filteredHooks = validatedOutput.hooks.filter(hook => !hasForbiddenWords(hook))
      
      // 不足分をフォールバックで補完
      let finalHooks = [...filteredHooks]
      if (finalHooks.length < 5) {
        const fallbacks = getFallbackHooks(industry, topic)
        const needed = 5 - finalHooks.length
        finalHooks.push(...fallbacks.slice(0, needed))
      }

      return c.json({
        hooks: finalHooks.slice(0, 5),
        meta: {
          source: 'openai',
          goal, industry, tone, topic,
          filtered_count: validatedOutput.hooks.length - filteredHooks.length
        }
      })

    } catch (aiError) {
      console.error('OpenAI API error, using fallback:', aiError)
      
      return c.json({
        hooks: getFallbackHooks(industry, topic),
        meta: {
          source: 'fallback_after_error',
          error: aiError instanceof Error ? aiError.message : 'Unknown error',
          goal, industry, tone, topic
        }
      })
    }

  } catch (error) {
    console.error('Hook generation error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ 
        message: 'リクエストデータが正しくありません', 
        details: error.message 
      }, 400)
    }

    return c.json({ 
      message: 'Hook生成中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})