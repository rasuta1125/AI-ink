import { Hono } from 'hono'
import { HashtagRequestSchema, HashtagResponseSchema, normalizeHashtags } from '../lib/schemas'
import { callOpenAIWithRetry } from '../lib/openai'
import { getFallbackHashtags } from '../lib/fallbacks'

export const hashtagRoutes = new Hono<{
  Bindings: {
    OPENAI_API_KEY: string
  }
}>()

hashtagRoutes.post('/', async (c) => {
  try {
    // リクエストボディの検証
    const body = await c.req.json()
    const validatedInput = HashtagRequestSchema.parse(body)
    const { industry, topic } = validatedInput

    // OpenAI API Key の取得
    const apiKey = c.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OpenAI API key not found, using fallback')
      return c.json({
        hashtags: normalizeHashtags(getFallbackHashtags(industry, topic)),
        meta: {
          source: 'fallback',
          industry, topic,
          distribution: { general: 2, category: 2, niche: 2 }
        }
      })
    }

    // プロンプト作成
    const prompt = `
あなたはSNSのハッシュタグ選定アシスタント。日本語で回答。
業種:${industry} トピック:${topic}

要件:
- ハッシュタグ6個。配合は[汎用2,カテゴリ2,ニッチ2]。本文とは別行前提。
- すべて半角#で正規化。重複・禁止語を避ける。
- 汎用：幅広く使える一般的なタグ
- カテゴリ：業種特有のタグ
- ニッチ：トピック特化のタグ

出力形式: {"hashtags":["#...","#...","#...","#...","#...","#..."]}
    `.trim()

    try {
      // OpenAI API 呼び出し
      const result = await callOpenAIWithRetry(prompt, apiKey)
      
      // 出力検証
      const validatedOutput = HashtagResponseSchema.parse(result)
      
      // ハッシュタグ正規化と重複除去
      let hashtags = normalizeHashtags(validatedOutput.hashtags)
      hashtags = Array.from(new Set(hashtags)) // 重複除去
      
      // 6個に調整
      if (hashtags.length < 6) {
        const fallbacks = normalizeHashtags(getFallbackHashtags(industry, topic))
        const needed = 6 - hashtags.length
        const additionalTags = fallbacks.filter(tag => !hashtags.includes(tag))
        hashtags.push(...additionalTags.slice(0, needed))
      }

      return c.json({
        hashtags: hashtags.slice(0, 6),
        meta: {
          source: 'openai',
          industry, topic,
          distribution: { general: 2, category: 2, niche: 2 }
        }
      })

    } catch (aiError) {
      console.error('OpenAI API error, using fallback:', aiError)
      
      return c.json({
        hashtags: normalizeHashtags(getFallbackHashtags(industry, topic)),
        meta: {
          source: 'fallback_after_error',
          error: aiError instanceof Error ? aiError.message : 'Unknown error',
          industry, topic,
          distribution: { general: 2, category: 2, niche: 2 }
        }
      })
    }

  } catch (error) {
    console.error('Hashtag generation error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ 
        message: 'リクエストデータが正しくありません', 
        details: error.message 
      }, 400)
    }

    return c.json({ 
      message: 'ハッシュタグ生成中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})