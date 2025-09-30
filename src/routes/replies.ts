import { Hono } from 'hono'

const app = new Hono()

// 返信生成API
app.post('/', async (c) => {
  try {
    const { inquiry, tone, userKnowledge } = await c.req.json()
    
    // 入力バリデーション
    if (!inquiry || !tone || !userKnowledge) {
      return c.json({ 
        success: false, 
        message: '必要な情報が不足しています。'
      }, 400)
    }

    // Firebase Authentication トークン検証（実装時に追加）
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ 
        success: false, 
        message: '認証が必要です。'
      }, 401)
    }

    // OpenAI APIキーの確認
    const openaiApiKey = Bun.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.log('⚠️ OpenAI API Key not found, using fallback responses')
      return generateFallbackReplies(inquiry, tone, userKnowledge)
    }

    // OpenAI API呼び出し
    const replies = await generateAIReplies(inquiry, tone, userKnowledge, openaiApiKey)
    
    return c.json({
      success: true,
      replies: replies
    })

  } catch (error) {
    console.error('返信生成エラー:', error)
    
    // エラー時はフォールバック
    const { inquiry, tone, userKnowledge } = await c.req.json().catch(() => ({}))
    if (inquiry && tone && userKnowledge) {
      return generateFallbackReplies(inquiry, tone, userKnowledge)
    }
    
    return c.json({ 
      success: false, 
      message: 'サーバーエラーが発生しました。'
    }, 500)
  }
})

// OpenAI APIで返信生成
async function generateAIReplies(inquiry: string, tone: string, userKnowledge: any, apiKey: string) {
  const toneInstructions = {
    polite: '丁寧で敬語を使った、プロフェッショナルな対応',
    casual: '親しみやすく、親近感のある対応',
    firm: '簡潔で明確、要点を絞った対応'
  }

  const systemPrompt = `あなたは${userKnowledge.businessType}を営む「${userKnowledge.businessName}」のカスタマーサポート担当です。

【事業情報】
- 業種: ${userKnowledge.businessType}
- 店舗名: ${userKnowledge.businessName}
- サービス・料金: ${userKnowledge.services}
${userKnowledge.businessHours ? `- 営業時間: ${userKnowledge.businessHours}` : ''}
${userKnowledge.reservationInfo ? `- 予約・アクセス: ${userKnowledge.reservationInfo}` : ''}
${userKnowledge.features ? `- 特徴・セールスポイント: ${userKnowledge.features}` : ''}
${userKnowledge.websiteUrl ? `- ウェブサイト: ${userKnowledge.websiteUrl}` : ''}

【対応指針】
- ${toneInstructions[tone as keyof typeof toneInstructions]}で回答してください
- 問い合わせ内容に対して適切で具体的な情報を提供してください
- 必要に応じて上記の事業情報を活用してください
- 自然で人間らしい返信を心がけてください
- 各パターンは異なるアプローチで回答してください

以下の問い合わせに対して、3つの異なるパターンの返信を生成してください。`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `問い合わせ内容: ${inquiry}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || ''

    // AIレスポンスを3つのパターンに分割
    const patterns = aiResponse.split(/パターン[1-3][:：]?/).filter(text => text.trim())
    
    const replies = patterns.slice(0, 3).map((pattern, index) => ({
      style: `AI生成パターン${index + 1}`,
      text: pattern.trim()
    }))

    // 3パターン未満の場合はフォールバックで補完
    while (replies.length < 3) {
      const fallback = generateFallbackReplies(inquiry, tone, userKnowledge)
      if (fallback.replies && fallback.replies[replies.length]) {
        replies.push(fallback.replies[replies.length])
      } else {
        break
      }
    }

    return replies

  } catch (error) {
    console.error('OpenAI API call failed:', error)
    throw error
  }
}

// フォールバック返信生成
function generateFallbackReplies(inquiry: string, tone: string, userKnowledge: any) {
  const toneMap = {
    polite: '丁寧',
    casual: 'カジュアル',
    firm: 'きっぱり'
  }

  const greetings = {
    polite: 'お問い合わせいただきありがとうございます。',
    casual: 'ありがとうございます！',
    firm: 'お問い合わせありがとうございます。'
  }

  const closings = {
    polite: 'ご不明な点がございましたら、お気軽にお問い合わせください。\\n\\nよろしくお願いいたします。',
    casual: '他にも気になることがあれば、いつでもお声がけくださいね。',
    firm: 'その他ご質問がありましたらお知らせください。'
  }

  const toneKey = tone as keyof typeof toneMap
  
  const replies = [
    {
      style: `${toneMap[toneKey]}（パターン1）`,
      text: `${greetings[toneKey]}\\n\\n「${inquiry}」についてのご質問ですね。\\n\\n${userKnowledge.businessName || '当店'}では、${userKnowledge.services}をご提供しております。\\n\\n${closings[toneKey]}`
    },
    {
      style: `${toneMap[toneKey]}（パターン2）`,
      text: `${greetings[toneKey]}\\n\\n${userKnowledge.services}についてお答えいたします。\\n\\n${userKnowledge.reservationInfo || 'お電話またはオンラインでご予約いただけます'}。\\n\\n${closings[toneKey]}`
    },
    {
      style: `${toneMap[toneKey]}（パターン3）`,
      text: `${greetings[toneKey]}\\n\\n${userKnowledge.businessType}の件でのお問い合わせですね。\\n\\n詳しくは${userKnowledge.businessHours ? userKnowledge.businessHours + 'にお電話' : 'お気軽にご連絡'}ください。\\n\\n${closings[toneKey]}`
    }
  ]

  return {
    success: true,
    replies: replies
  }
}

export { app as repliesRoutes }