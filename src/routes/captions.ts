import { Hono } from 'hono'
import { CaptionRequestSchema, CaptionResponseSchema, hasForbiddenWords } from '../lib/schemas'
import { callOpenAIWithRetry } from '../lib/openai'
import { getFallbackCaption } from '../lib/fallbacks'

export const captionRoutes = new Hono<{
  Bindings: {
    OPENAI_API_KEY: string
  }
}>()

captionRoutes.post('/', async (c) => {
  try {
    // リクエストボディの検証
    const body = await c.req.json()
    const validatedInput = CaptionRequestSchema.parse(body)
    const { goal, industry, tone, topic, length } = validatedInput

    // OpenAI API Key の取得
    const apiKey = c.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OpenAI API key not found, using fallback')
      return c.json({
        captions: getFallbackCaption(industry, tone, topic, length),
        meta: {
          source: 'fallback',
          goal, industry, tone, topic, length,
          length_ranges: {
            short: '120-180字',
            mid: '200-350字',
            long: '400-600字'
          }
        }
      })
    }

    // 文字数範囲の定義
    const lengthRanges = {
      short: '120–180',
      mid: '200–350',
      long: '400–600'
    }

    // プロンプト作成
    const prompt = `
あなたはSNSコピーライター。日本語で回答し、結果をJSON形式で出力してください。
目的:${goal} 業種:${industry} トーン:${tone} トピック:${topic} 長さ:${length}

要件:
- 3案。各案は Hook→本文→CTA→ハッシュタグ6個 の順で構成。
- CTAは「動詞+場所(プロフィール/DM/リンク/フォーム)+期限/条件」を含む。
- ハッシュタグは6個(汎用2/カテゴリ2/ニッチ2)。本文とは別行。
- 長さ: short=${lengthRanges.short} / mid=${lengthRanges.mid} / long=${lengthRanges.long} 字。
- 誇大表現や断定的効果保証は使わない。
- トーンに応じた自然な日本語で。

出力形式:
{"captions":[
  {"text":"Hook\\n\\n本文\\n\\nCTA\\n\\n#tag1 #tag2 #tag3 #tag4 #tag5 #tag6","parts":{"hook":"...","body":"...","cta":"...","hashtags":["#...","#...","#...","#...","#...","#..."]}},
  {"text":"...","parts":{...}},
  {"text":"...","parts":{...}}
]}
    `.trim()

    try {
      // OpenAI API 呼び出し
      const result = await callOpenAIWithRetry(prompt, apiKey)
      
      // 出力検証
      const validatedOutput = CaptionResponseSchema.parse(result)
      
      // 禁止語チェック
      const filteredCaptions = validatedOutput.captions.filter(caption => 
        !hasForbiddenWords(caption.text)
      )
      
      // 不足分をフォールバックで補完
      let finalCaptions = [...filteredCaptions]
      if (finalCaptions.length < 3) {
        const fallbacks = getFallbackCaption(industry, tone, topic, length)
        const needed = 3 - finalCaptions.length
        for (let i = 0; i < needed; i++) {
          finalCaptions.push(fallbacks[0]) // 同じフォールバックを使用
        }
      }

      return c.json({
        captions: finalCaptions.slice(0, 3),
        meta: {
          source: 'openai',
          goal, industry, tone, topic, length,
          length_ranges: {
            short: '120-180字',
            mid: '200-350字',
            long: '400-600字'
          },
          filtered_count: validatedOutput.captions.length - filteredCaptions.length
        }
      })

    } catch (aiError) {
      console.error('OpenAI API error, using fallback:', aiError)
      
      return c.json({
        captions: getFallbackCaption(industry, tone, topic, length),
        meta: {
          source: 'fallback_after_error',
          error: aiError instanceof Error ? aiError.message : 'Unknown error',
          goal, industry, tone, topic, length,
          length_ranges: {
            short: '120-180字',
            mid: '200-350字',
            long: '400-600字'
          }
        }
      })
    }

  } catch (error) {
    console.error('Caption generation error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ 
        message: 'リクエストデータが正しくありません', 
        details: error.message 
      }, 400)
    }

    return c.json({ 
      message: 'フル本文生成中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})