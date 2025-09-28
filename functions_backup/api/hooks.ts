import { callOpenAIWithRetry, HookSchema } from '../_lib/openai'
import { validateHookRequest } from '../_lib/validation'
import { getFallbackHooks, hasForbiddenWords } from '../_lib/fallbacks'

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
    const validatedInput = validateHookRequest(body)
    const { goal, industry, tone, topic } = validatedInput

    // OpenAI API Key の確認
    const apiKey = env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OpenAI API key not found, using fallback')
      return new Response(JSON.stringify({
        hooks: getFallbackHooks(industry, tone, topic),
        meta: {
          source: 'fallback',
          goal, industry, tone, topic
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // プロンプト作成
    const prompt = `
あなたはSNSコピーライター。日本語で回答し、結果をJSON形式で出力してください。
目的:${goal} 業種:${industry} トーン:${tone} トピック:${topic}

要件:
- Hookを5つ。各文は最初の3秒で注目を引く。
- 15〜30字、疑問文や感嘆文を積極活用。
- ${tone}なトーンで、${topic}に関連する内容。
- 読み手の感情を動かし、続きを読みたくさせる。
- 誇大表現や断定的効果保証は使わない。

出力形式: {"hooks":["h1","h2","h3","h4","h5"]}
    `.trim()

    try {
      // OpenAI API 呼び出し
      const result = await callOpenAIWithRetry(prompt, apiKey, HookSchema)
      
      // 禁止語チェック
      const filteredHooks = result.hooks.filter((hook: string) => !hasForbiddenWords(hook))
      
      // 不足分をフォールバックで補完
      let finalHooks = [...filteredHooks]
      if (finalHooks.length < 5) {
        const fallbacks = getFallbackHooks(industry, tone, topic)
        const needed = 5 - finalHooks.length
        finalHooks.push(...fallbacks.slice(0, needed))
      }

      return new Response(JSON.stringify({
        hooks: finalHooks.slice(0, 5),
        meta: {
          source: 'openai',
          goal, industry, tone, topic,
          filtered_count: result.hooks.length - filteredHooks.length
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (aiError) {
      console.error('OpenAI API error, using fallback:', aiError)
      
      return new Response(JSON.stringify({
        hooks: getFallbackHooks(industry, tone, topic),
        meta: {
          source: 'fallback_after_error',
          error: aiError instanceof Error ? aiError.message : 'Unknown error',
          goal, industry, tone, topic
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Hook generation error:', error)
    
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