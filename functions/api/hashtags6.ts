// ハッシュタグ生成API
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
    const { topic, platform } = await request.json();
    
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

    const platformMapping = {
      instagram: 'Instagram（エンゲージメント重視、人気ハッシュタグ含む）',
      twitter: 'Twitter（トレンド性重視、短めで覚えやすい）',
      tiktok: 'TikTok（バイラル性重視、若者向け）',
      linkedin: 'LinkedIn（ビジネス・プロフェッショナル向け）'
    };

    const selectedPlatform = platformMapping[platform as keyof typeof platformMapping] || 'Instagram';

    // OpenAI APIを呼び出してハッシュタグを生成
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
            content: 'あなたは優秀なSNSマーケティング専門家です。与えられたトピックとプラットフォームに最適化されたハッシュタグを生成してください。'
          },
          {
            role: 'user',
            content: `トピック: ${topic}\nプラットフォーム: ${selectedPlatform}\n\n上記のトピックについて、${selectedPlatform}で効果的なハッシュタグを20個生成してください。人気度と関連性を考慮し、#を付けて1行に1つずつ表示してください。`
          }
        ],
        temperature: 0.6,
        max_tokens: 600,
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
    
    // 生成されたテキストからハッシュタグを抽出
    const hashtags = generatedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('#'))
      .slice(0, 20);

    return new Response(JSON.stringify({ 
      success: true,
      hashtags: hashtags.length > 0 ? hashtags : ['#' + topic.replace(/\s+/g, '')]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Hashtag Generation Error:', error);
    return new Response(JSON.stringify({ error: 'ハッシュタグ生成でエラーが発生しました' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};