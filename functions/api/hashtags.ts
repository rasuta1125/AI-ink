// ハッシュタグ生成API - Firebase認証付き
import { authenticateRequest } from "../_lib/auth";

export interface Env {
  FIREBASE_PROJECT_ID: string;
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
    // Firebase IDトークン検証
    const user = await authenticateRequest(request, env.FIREBASE_PROJECT_ID);
    console.log('認証済みユーザー:', user.email);

    // リクエストボディ取得
    const body = await request.json() as {
      industry: string;
      topic: string;
    };

    // ハッシュタグ生成ロジック（フォールバック実装）
    const hashtags = generateHashtagsFallback(body);

    return new Response(JSON.stringify({ hashtags }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Hashtags API エラー:', error);
    
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

function generateHashtagsFallback(params: {
  industry: string;
  topic: string;
}): string[] {
  const { industry, topic } = params;

  // 汎用タグ (2個)
  const generalTags = ['#今日', '#おすすめ', '#情報', '#お知らせ', '#発見'];
  
  // 業種別カテゴリタグ (2個)
  const categoryTags = {
    creator: ['#クリエイター', '#デザイン', '#アート', '#制作'],
    salon: ['#美容', '#サロン', '#エステ', '#癒し'],
    ec: ['#ショップ', '#ハンドメイド', '#EC', '#商品'],
    local: ['#地域', '#イベント', '#ローカル', '#まちづくり'],
    other: ['#ビジネス', '#仕事', '#ライフスタイル', '#日常']
  };

  // トピック特化ニッチタグ (2個)
  const topicWords = topic.split(' ').filter(word => word.length > 1);
  const nicheTags = [
    `#${topicWords[0] || 'お得'}`,
    `#${topic.slice(0, 4) || 'おすすめ'}情報`,
    '#限定', '#新着', '#特別', '#注目'
  ];

  const industryKey = industry as keyof typeof categoryTags;
  const selectedCategoryTags = categoryTags[industryKey] || categoryTags.other;

  // 2:2:2の構成で6個選択
  return [
    ...generalTags.slice(0, 2),        // 汎用×2
    ...selectedCategoryTags.slice(0, 2), // カテゴリ×2
    ...nicheTags.slice(0, 2)           // ニッチ×2
  ];
}