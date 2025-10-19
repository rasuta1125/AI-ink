// キャプション生成API
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
    const { topic, tone, length } = await request.json();
    
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
      casual: 'カジュアルで親しみやすい',
      professional: 'プロフェッショナルで丁寧な',
      fun: '楽しくエネルギッシュな',
      inspirational: 'インスピレーショナルで前向きな',
      informative: '情報的で教育的な'
    };

    const lengthMapping = {
      short: '短文（1-2文、50文字程度）',
      medium: '中文（3-5文、150文字程度）',
      long: '長文（6文以上、300文字程度）'
    };

    const selectedTone = toneMapping[tone as keyof typeof toneMapping] || 'バランスの取れた';
    const selectedLength = lengthMapping[length as keyof typeof lengthMapping] || '中文';

    // OpenAI APIを呼び出してキャプションを生成
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
            content: 'あなたは優秀なSNSコンテンツクリエイターです。与えられたトピック、トーン、文字数に基づいて魅力的なSNSキャプションを生成してください。'
          },
          {
            role: 'user',
            content: `トピック: ${topic}\nトーン: ${selectedTone}\n文字数: ${selectedLength}\n\n上記の条件で魅力的なSNSキャプションを3つ生成してください。各キャプションは指定された文字数とトーンに合わせて、エンゲージメントを高める内容にしてください。`
          }
        ],
        temperature: 0.8,
        max_tokens: 800,
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
    
    // 生成されたテキストをキャプションの配列に分割
    const captions = generatedText
      .split(/\n\n+|\d+[.\)]\s*/)
      .filter(text => text.trim())
      .map(text => text.trim())
      .slice(0, 3);

    return new Response(JSON.stringify({ 
      success: true,
      captions: captions.length > 0 ? captions : [generatedText.trim()]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Caption Generation Error:', error);
    return new Response(JSON.stringify({ error: 'キャプション生成でエラーが発生しました' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};