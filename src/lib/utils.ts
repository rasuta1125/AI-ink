import { forbiddenWords } from './presets'

// 文字数チェック
export function checkLength(text: string, min: number, max: number): boolean {
  const length = text.length
  return length >= min && length <= max
}

// 禁止語チェック
export function checkForbiddenWords(text: string): boolean {
  return !forbiddenWords.some(word => text.includes(word))
}

// 重複チェック
export function checkDuplication(texts: string[]): boolean {
  const unique = new Set(texts)
  return unique.size === texts.length
}

// 同語尾連続チェック
export function checkSameSuffix(texts: string[]): boolean {
  if (texts.length < 2) return true
  
  for (let i = 1; i < texts.length; i++) {
    const prev = texts[i - 1]
    const curr = texts[i]
    
    // 最後の文字が同じかチェック
    if (prev.slice(-1) === curr.slice(-1)) {
      return false
    }
  }
  return true
}

// CTA構造チェック（動詞 + 場所 + 期限/条件）
export function checkCTAStructure(cta: string): boolean {
  // 基本的な構造があるかチェック
  const hasVerb = /^(チェック|確認|見て|覗いて|タップ|クリック|アクセス|訪問|来店|予約|申し込み|登録|参加|体験|購入|注文|相談|問い合わせ|連絡|メッセージ|DM)/.test(cta)
  const hasLocation = /(プロフィール|リンク|DM|フォーム|サイト|ページ|ストーリー)/.test(cta)
  
  return hasVerb || hasLocation
}

// ハッシュタグ正規化
export function normalizeHashtag(tag: string): string {
  // #を追加（なければ）
  if (!tag.startsWith('#')) {
    tag = '#' + tag
  }
  
  // 全角英数字を半角に変換
  tag = tag.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  })
  
  return tag
}

// ランダム選択
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// 複数のランダム選択（重複なし）
export function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, array.length))
}

// 品質スコア計算
export function calculateQualityScore(text: string, type: 'hook' | 'cta' | 'caption'): number {
  let score = 100
  
  // 禁止語チェック
  if (!checkForbiddenWords(text)) score -= 30
  
  // 文字数チェック
  let lengthRange: [number, number]
  switch (type) {
    case 'hook':
      lengthRange = [24, 48]
      break
    case 'cta':
      lengthRange = [35, 70]
      break
    case 'caption':
      lengthRange = [120, 600]
      break
  }
  
  if (!checkLength(text, lengthRange[0], lengthRange[1])) {
    score -= 20
  }
  
  // CTA構造チェック
  if (type === 'cta' && !checkCTAStructure(text)) {
    score -= 25
  }
  
  // 絵文字過多チェック
  const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length
  if (emojiCount > text.length * 0.1) {
    score -= 15
  }
  
  return Math.max(0, score)
}

// テキスト生成のヘルパー関数
export function generateVariations(template: string, keywords: string[], count: number = 5): string[] {
  const variations: string[] = []
  
  for (let i = 0; i < count; i++) {
    let text = template
    
    // キーワード置換
    text = text.replace('{キーワード}', randomChoice(keywords))
    text = text.replace('{数字}', String(Math.floor(Math.random() * 9) + 1))
    
    variations.push(text)
  }
  
  return variations
}