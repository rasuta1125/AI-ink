// Hook生成API
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
    const { topic } = await request.json();
    
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

    // OpenAI APIを呼び出してフックを生成
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
            content: 'あなたは優秀なコピーライターです。与えられたトピックに対して、読者の注意を引く魅力的なフックを5つ生成してください。各フックは簡潔で印象的で、読者が続きを読みたくなるようなものにしてください。'
          },
          {
            role: 'user',
            content: `トピック: ${topic}\n\n上記のトピックについて、SNSやブログで使える魅力的なフックを5つ生成してください。各フックは1-2行程度で、読者の興味を引くものにしてください。`
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
    
    // 生成されたテキストをフックの配列に分割
    const hooks = generatedText
      .split('\n')
      .filter(line => line.trim() && (line.match(/^\d+/) || line.includes('・') || line.includes('-')))
      .map(line => line.replace(/^\d+[.\)]\s*/, '').replace(/^[・-]\s*/, '').trim())
      .slice(0, 5);

    return new Response(JSON.stringify({ 
      success: true,
      hooks: hooks.length > 0 ? hooks : [generatedText.trim()]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Hook Generation Error:', error);
    return new Response(JSON.stringify({ error: 'フック生成でエラーが発生しました' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};