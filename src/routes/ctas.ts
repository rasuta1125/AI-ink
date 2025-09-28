import { Hono } from 'hono'
import { CTARequestSchema, CTAResponseSchema, hasForbiddenWords } from '../lib/schemas'
import { callOpenAIWithRetry } from '../lib/openai'
import { getFallbackCTAs } from '../lib/fallbacks'

export const ctaRoutes = new Hono<{
  Bindings: {
    OPENAI_API_KEY: string
  }
}>()

ctaRoutes.post('/', async (c) => {
  try {
    // リクエストボディの検証
    const body = await c.req.json()
    const validatedInput = CTARequestSchema.parse(body)
    const { goal, path, deadline, topic } = validatedInput

    // OpenAI API Key の取得
    const apiKey = c.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OpenAI API key not found, using fallback')
      return c.json({
        ctas: getFallbackCTAs('other', path, topic),
        meta: {
          source: 'fallback',
          goal, path, deadline, topic
        }
      })
    }

    // プロンプト作成
    const prompt = `
あなたはSNSコピーライター。日本語で回答し、結果をJSON形式で出力してください。
目的:${goal} 導線:${path} 期限:${deadline} トピック:${topic}

要件:
- CTAを5つ。各文は「動詞+期限/条件+行き先(${path})」を含む。
- 35〜70字、受け身禁止、迷いを残さない。
- 誇大表現や断定的効果保証は使わない。
- 次のアクションが明確で実行しやすい。

出力形式: {"ctas":["c1","c2","c3","c4","c5"]}
    `.trim()

    try {
      // OpenAI API 呼び出し
      const result = await callOpenAIWithRetry(prompt, apiKey)
      
      // 出力検証
      const validatedOutput = CTAResponseSchema.parse(result)
      
      // 禁止語チェック
      const filteredCTAs = validatedOutput.ctas.filter(cta => !hasForbiddenWords(cta))
      
      // 不足分をフォールバックで補完
      let finalCTAs = [...filteredCTAs]
      if (finalCTAs.length < 5) {
        const fallbacks = getFallbackCTAs('other', path, topic)
        const needed = 5 - finalCTAs.length
        finalCTAs.push(...fallbacks.slice(0, needed))
      }

      return c.json({
        ctas: finalCTAs.slice(0, 5),
        meta: {
          source: 'openai',
          goal, path, deadline, topic,
          filtered_count: validatedOutput.ctas.length - filteredCTAs.length
        }
      })

    } catch (aiError) {
      console.error('OpenAI API error, using fallback:', aiError)
      
      return c.json({
        ctas: getFallbackCTAs('other', path, topic),
        meta: {
          source: 'fallback_after_error',
          error: aiError instanceof Error ? aiError.message : 'Unknown error',
          goal, path, deadline, topic
        }
      })
    }

  } catch (error) {
    console.error('CTA generation error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ 
        message: 'リクエストデータが正しくありません', 
        details: error.message 
      }, 400)
    }

    return c.json({ 
      message: 'CTA生成中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})