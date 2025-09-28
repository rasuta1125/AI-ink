import { z } from 'zod'

// 共通入力パラメータ
export const BaseRequestSchema = z.object({
  goal: z.enum(['認知', '保存', 'CV']),
  industry: z.enum(['creator', 'salon', 'ec', 'local', 'other']),
  tone: z.enum(['フレンドリー', '専門家', 'エモい', 'きっぱり']),
  topic: z.string().min(1).max(100, 'トピックは100文字以内で入力してください'),
})

// Hookメーカー用スキーマ
export const HookRequestSchema = BaseRequestSchema.pick({
  goal: true,
  industry: true,
  tone: true,
  topic: true,
})

// CTAビルダー用スキーマ
export const CTARequestSchema = z.object({
  goal: z.enum(['認知', '保存', 'CV']),
  path: z.enum(['プロフィール', 'リンク', 'DM', 'フォーム']),
  deadline: z.enum(['なし', '今週中']).or(z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/)),
  topic: z.string().min(1).max(100),
})

// ハッシュタグ用スキーマ
export const HashtagRequestSchema = z.object({
  industry: z.enum(['creator', 'salon', 'ec', 'local', 'other']),
  topic: z.string().min(1).max(100),
})

// フル本文用スキーマ
export const CaptionRequestSchema = BaseRequestSchema.extend({
  length: z.enum(['short', 'mid', 'long']),
})

// 出力スキーマ
export const HookResponseSchema = z.object({
  hooks: z.array(z.string()).length(5),
})

export const CTAResponseSchema = z.object({
  ctas: z.array(z.string()).length(5),
})

export const HashtagResponseSchema = z.object({
  hashtags: z.array(z.string()).length(6),
})

export const CaptionResponseSchema = z.object({
  captions: z.array(z.object({
    text: z.string(),
    parts: z.object({
      hook: z.string(),
      body: z.string(),
      cta: z.string(),
      hashtags: z.array(z.string()).length(6),
    }),
  })).length(3),
})

// 禁止語リスト
export const forbiddenWords = [
  '絶対', '必ず', '100%', '完全', '永久', '最高', '最強', '最安',
  '効果保証', '確実', '間違いなし', '失敗なし', 'リスクゼロ',
  '誰でも', '簡単に', '楽して', '何もしなくても'
]

// 禁止語チェック関数
export function hasForbiddenWords(text: string): boolean {
  return forbiddenWords.some(word => text.includes(word))
}

// ハッシュタグ正規化関数
export function normalizeHashtags(hashtags: string[]): string[] {
  return hashtags.map(tag => {
    // #を追加（なければ）
    if (!tag.startsWith('#')) {
      tag = '#' + tag
    }
    
    // 全角英数字を半角に変換
    tag = tag.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    })
    
    // スペースを削除
    tag = tag.replace(/\s+/g, '')
    
    return tag
  })
}