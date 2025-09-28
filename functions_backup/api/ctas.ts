import { callOpenAIWithRetry, CTASchema } from '../_lib/openai'
import { validateCTARequest } from '../_lib/validation'
import { getFallbackCTAs, hasForbiddenWords } from '../_lib/fallbacks'

interface Env {
  OPENAI_API_KEY: string
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
    const validatedInput = validateCTARequest(body)
    const { goal, path, deadline, topic } = validatedInput

    // OpenAI API Key の確認
    const apiKey = env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OpenAI API key not found, using fallback')
      return new Response(JSON.stringify({
        ctas: getFallbackCTAs('other', path, topic),
        meta: {
          source: 'fallback',
          goal, path, deadline, topic
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
      const result = await callOpenAIWithRetry(prompt, apiKey, CTASchema)
      
      // 禁止語チェック
      const filteredCTAs = result.ctas.filter((cta: string) => !hasForbiddenWords(cta))
      
      // 不足分をフォールバックで補完
      let finalCTAs = [...filteredCTAs]
      if (finalCTAs.length < 5) {
        const fallbacks = getFallbackCTAs('other', path, topic)
        const needed = 5 - finalCTAs.length
        finalCTAs.push(...fallbacks.slice(0, needed))
      }

      return new Response(JSON.stringify({
        ctas: finalCTAs.slice(0, 5),
        meta: {
          source: 'openai',
          goal, path, deadline, topic,
          filtered_count: result.ctas.length - filteredCTAs.length
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (aiError) {
      console.error('OpenAI API error, using fallback:', aiError)
      
      return new Response(JSON.stringify({
        ctas: getFallbackCTAs('other', path, topic),
        meta: {
          source: 'fallback_after_error',
          error: aiError instanceof Error ? aiError.message : 'Unknown error',
          goal, path, deadline, topic
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('CTA generation error:', error)
    
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