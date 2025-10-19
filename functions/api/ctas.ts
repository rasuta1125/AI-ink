// CTA生成API
export interface Env {
  OPENAI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // CORS対応
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    const { topic, tone } = await request.json();
    
    if (!topic) {
      return new Response(JSON.stringify({ error: 'トピックが必要です' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const openaiApiKey = env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const toneMapping = {
      urgent: '緊急性を感じさせる',
      friendly: 'フレンドリーで親しみやすい',
      professional: 'プロフェッショナルで信頼感のある',
      emotional: '感情に訴える',
      casual: 'カジュアルで気軽な'
    };

    const selectedTone = toneMapping[tone as keyof typeof toneMapping] || 'バランスの取れた';

    // OpenAI APIを呼び出してCTAを生成
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'あなたは優秀なコピーライターです。与えられたトピックに対して、読者の行動を促す効果的なCTA（Call to Action）を生成してください。'
          },
          {
            role: 'user',
            content: `トピック: ${topic}\nトーン: ${selectedTone}\n\n上記のトピックについて、${selectedTone}トーンで効果的なCTAを5つ生成してください。各CTAは簡潔で行動を促すものにしてください。`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      return new Response(JSON.stringify({ error: 'OpenAI API呼び出しエラー' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || '';
    
    // 生成されたテキストをCTAの配列に分割
    const ctas = generatedText
      .split('\n')
      .filter(line => line.trim() && (line.match(/^\d+/) || line.includes('・') || line.includes('-')))
      .map(line => line.replace(/^\d+[.\)]\s*/, '').replace(/^[・-]\s*/, '').trim())
      .slice(0, 5);

    return new Response(JSON.stringify({ 
      success: true,
      ctas: ctas.length > 0 ? ctas : [generatedText.trim()]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('CTA Generation Error:', error);
    return new Response(JSON.stringify({ error: 'CTA生成でエラーが発生しました' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};