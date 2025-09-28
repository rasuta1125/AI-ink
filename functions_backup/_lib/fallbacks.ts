// フォールバック用のテンプレート

export function getFallbackHooks(industry: string, tone: string, topic: string) {
  const hooks = [
    `${topic}について知ってる？`,
    `実は${topic}には秘密がある`,
    `${topic}で変わる日常`,
    `みんなが知らない${topic}の話`,
    `${topic}の新常識`
  ]
  return hooks
}

export function getFallbackCTAs(industry: string, path: string, topic: string) {
  const pathText = {
    'プロフィール': 'プロフィール',
    'リンク': 'リンク',
    'DM': 'DM',
    'フォーム': 'フォーム'
  }[path] || 'プロフィール'

  const ctas = [
    `詳しくは${pathText}をチェック！`,
    `気になったら${pathText}へどうぞ`,
    `もっと知りたい方は${pathText}を見てね`,
    `続きは${pathText}で確認してください`,
    `${pathText}で詳細をご覧ください`
  ]
  return ctas
}

export function getFallbackHashtags(industry: string, topic: string) {
  const hashtags = [
    '#ライフスタイル',
    '#おすすめ',
    '#情報',
    '#便利',
    '#日常',
    '#豆知識'
  ]
  return hashtags
}

export function getFallbackCaption(industry: string, tone: string, topic: string, length: string) {
  const caption = {
    text: `${topic}について\n\n今日は${topic}についてお話しします。皆さんにとって役立つ情報をお届けできれば嬉しいです。\n\n詳しくはプロフィールをチェックしてください！\n\n#ライフスタイル #おすすめ #情報 #便利 #日常 #豆知識`,
    parts: {
      hook: `${topic}について`,
      body: `今日は${topic}についてお話しします。皆さんにとって役立つ情報をお届けできれば嬉しいです。`,
      cta: '詳しくはプロフィールをチェックしてください！',
      hashtags: ['#ライフスタイル', '#おすすめ', '#情報', '#便利', '#日常', '#豆知識']
    }
  }
  
  return [caption, caption, caption] // 3つのパターン
}

// 禁止語チェック
export function hasForbiddenWords(text: string): boolean {
  const forbiddenWords = [
    '必ず', '絶対', '確実', '保証', '100%', '完全', '永久', '最高', '最強', '奇跡'
  ]
  
  return forbiddenWords.some(word => text.includes(word))
}