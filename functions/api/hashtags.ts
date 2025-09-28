import { callOpenAIWithRetry, HashtagSchema } from '../_lib/openai'
import { validateHashtagRequest } from '../_lib/validation'
import { getFallbackHashtags } from '../_lib/fallbacks'

interface Env {
  OPENAI_API_KEY: string
}

// ハッシュタグ正規化
function normalizeHashtags(hashtags: string[]): string[] {
  return hashtags.map(tag => {
    let normalized = tag.trim()
    if (!normalized.startsWith('#')) {
      normalized = '#' + normalized
    }
    return normalized
  })
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    // リクエストボディの取得と検証
    const body = await request.json()
    const validatedInput = validateHashtagRequest(body)
    const { industry, topic } = validatedInput

    // OpenAI API Key の確認
    const apiKey = env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OpenAI API key not found, using fallback')
      return new Response(JSON.stringify({
        hashtags: normalizeHashtags(getFallbackHashtags(industry, topic)),
        meta: {
          source: 'fallback',
          industry, topic,
          distribution: { general: 2, category: 2, niche: 2 }
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // プロンプト作成
    const prompt = `
あなたはSNSのハッシュタグ選定アシスタント。日本語で回答し、結果をJSON形式で出力してください。
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
      const result = await callOpenAIWithRetry(prompt, apiKey, HashtagSchema)
      
      // ハッシュタグ正規化と重複除去
      let hashtags = normalizeHashtags(result.hashtags)
      hashtags = Array.from(new Set(hashtags)) // 重複除去
      
      // 6個に調整
      if (hashtags.length < 6) {
        const fallbacks = normalizeHashtags(getFallbackHashtags(industry, topic))
        const needed = 6 - hashtags.length
        const additionalTags = fallbacks.filter(tag => !hashtags.includes(tag))
        hashtags.push(...additionalTags.slice(0, needed))
      }

      return new Response(JSON.stringify({
        hashtags: hashtags.slice(0, 6),
        meta: {
          source: 'openai',
          industry, topic,
          distribution: { general: 2, category: 2, niche: 2 }
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (aiError) {
      console.error('OpenAI API error, using fallback:', aiError)
      
      return new Response(JSON.stringify({
        hashtags: normalizeHashtags(getFallbackHashtags(industry, topic)),
        meta: {
          source: 'fallback_after_error',
          error: aiError instanceof Error ? aiError.message : 'Unknown error',
          industry, topic,
          distribution: { general: 2, category: 2, niche: 2 }
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Hashtag generation error:', error)
    
    return new Response(JSON.stringify({ 
      message: 'リクエストデータが正しくありません', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// OPTIONS リクエスト対応（CORS preflight）
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}