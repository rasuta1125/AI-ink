import { Hono } from 'hono'
import { industryPresets, tonePresets } from '../lib/presets'
import { checkLength, calculateQualityScore } from '../lib/utils'

export const captionRoutes = new Hono()

interface CaptionRequest {
  goal: '認知' | '保存' | 'CV'
  industry: 'creator' | 'salon' | 'ec' | 'local' | 'other'
  tone: 'フレンドリー' | '専門家' | 'エモい' | 'きっぱり'
  topic: string
  length: 'short' | 'mid' | 'long'
}

captionRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<CaptionRequest>()
    const { goal, industry, tone, topic, length } = body

    // バリデーション
    if (!topic || topic.length > 100) {
      return c.json({ message: 'トピックは1-100文字で入力してください' }, 400)
    }

    // Hook, CTA, ハッシュタグを生成
    const hooks = await generateHooksForCaption(goal, industry, tone, topic)
    const ctas = await generateCTAsForCaption(goal, topic)
    const hashtags = await generateHashtagsForCaption(industry, topic)

    // フル本文生成（3案）
    const captions = []
    for (let i = 0; i < 3; i++) {
      const caption = generateSingleCaption({
        goal, industry, tone, topic, length,
        hook: hooks[i % hooks.length],
        cta: ctas[i % ctas.length],
        hashtags
      })
      captions.push(caption)
    }

    return c.json({
      captions,
      meta: {
        goal, industry, tone, topic: topic.substring(0, 50) + (topic.length > 50 ? '...' : ''),
        length,
        length_ranges: {
          short: '120-180字',
          mid: '200-350字', 
          long: '400-600字'
        },
        quality_scores: captions.map(c => calculateQualityScore(c.text, 'caption'))
      }
    })

  } catch (error) {
    console.error('Caption generation error:', error)
    return c.json({ 
      message: 'フル本文生成中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

async function generateHooksForCaption(goal: string, industry: string, tone: string, topic: string): Promise<string[]> {
  // Hook生成ロジック（簡略版）
  const preset = industryPresets[industry as keyof typeof industryPresets]
  const hooks = [
    `${topic}について大切なお話`,
    `今日は${topic}の話をします`,
    `${topic}の真実をお伝えします`,
    `みなさん、${topic}って知ってますか？`,
    `${topic}について質問が多いので`
  ]
  return hooks.slice(0, 3)
}

async function generateCTAsForCaption(goal: string, topic: string): Promise<string[]> {
  const ctas = [
    '詳細はプロフィールのリンクからチェックしてくださいね！',
    'DMでお気軽にご相談ください♪',
    'プロフィールから予約できます！お待ちしています',
    'リンクから詳しい情報をご確認いただけます',
    'ご質問はコメントやDMでお聞かせください'
  ]
  return ctas
}

async function generateHashtagsForCaption(industry: string, topic: string): Promise<string[]> {
  const preset = industryPresets[industry as keyof typeof industryPresets]
  const hashtags = [
    '#今日の投稿',
    '#情報シェア',
    ...preset.commonHashtags.slice(0, 2),
    `#${topic.substring(0, 6)}`,
    '#おすすめ'
  ]
  return hashtags.slice(0, 6)
}

interface CaptionGenerationParams {
  goal: string
  industry: string
  tone: string
  topic: string
  length: string
  hook: string
  cta: string
  hashtags: string[]
}

function generateSingleCaption(params: CaptionGenerationParams) {
  const { goal, industry, tone, topic, length, hook, cta, hashtags } = params
  
  const preset = industryPresets[industry as keyof typeof industryPresets]
  const toneInfo = tonePresets[tone as keyof typeof tonePresets]
  
  // 本文生成
  const body = generateBody(params)
  
  // 構成: Hook → 本文 → CTA → #タグ6
  const fullText = [
    hook,
    '', // 空行
    body,
    '', // 空行
    cta,
    '', // 空行
    hashtags.join(' ')
  ].join('\n')

  return {
    text: fullText,
    parts: {
      hook,
      body,
      cta,
      hashtags
    },
    length: fullText.length,
    goal,
    industry,
    tone
  }
}

function generateBody(params: CaptionGenerationParams): string {
  const { goal, industry, tone, topic, length } = params
  
  const preset = industryPresets[industry as keyof typeof industryPresets]
  const toneInfo = tonePresets[tone as keyof typeof tonePresets]
  
  // 長さ別のテンプレート
  let targetLength: [number, number]
  let templateType: 'simple' | 'detailed' | 'comprehensive'
  
  switch (length) {
    case 'short':
      targetLength = [60, 120] // Hook、CTA、ハッシュタグを除いた本文部分
      templateType = 'simple'
      break
    case 'mid':
      targetLength = [120, 250]
      templateType = 'detailed'
      break
    case 'long':
      targetLength = [300, 500]
      templateType = 'comprehensive'
      break
    default:
      targetLength = [60, 120]
      templateType = 'simple'
  }

  let body = ''

  // 業種別コンテンツテンプレート
  switch (industry) {
    case 'salon':
      body = generateSalonBody(topic, goal, templateType, toneInfo)
      break
    case 'ec':
      body = generateECBody(topic, goal, templateType, toneInfo)
      break
    case 'creator':
      body = generateCreatorBody(topic, goal, templateType, toneInfo)
      break
    case 'local':
      body = generateLocalBody(topic, goal, templateType, toneInfo)
      break
    default:
      body = generateGenericBody(topic, goal, templateType, toneInfo)
  }

  // 長さ調整
  if (body.length < targetLength[0]) {
    body = extendBody(body, toneInfo, templateType)
  } else if (body.length > targetLength[1]) {
    body = trimBody(body, targetLength[1])
  }

  return body
}

function generateSalonBody(topic: string, goal: string, templateType: string, toneInfo: any): string {
  const templates = {
    simple: `${topic}についてお客様からよくご質問をいただきます。

当サロンでは、一人ひとりのお客様に合わせた丁寧な施術を心がけています。`,
    
    detailed: `${topic}についてお客様からよくご質問をいただきます。

当サロンでは、一人ひとりのお客様に合わせた丁寧な施術を心がけています。お客様の理想を実現するために、カウンセリングから仕上がりまで、すべての工程で細やかな配慮をしております。

ご不明な点があれば、いつでもお気軽にお声がけください。`,
    
    comprehensive: `${topic}についてお客様からよくご質問をいただきます。

当サロンでは、一人ひとりのお客様に合わせた丁寧な施術を心がけています。お客様の理想を実現するために、カウンセリングから仕上がりまで、すべての工程で細やかな配慮をしております。

施術前には必ず詳しいカウンセリングを行い、お客様のライフスタイルやご希望をしっかりとお伺いします。そして、最適な施術プランをご提案させていただきます。

リラックスできる空間で、心地よい時間をお過ごしいただけるよう、スタッフ一同、日々技術向上に努めております。

ご不明な点があれば、いつでもお気軽にお声がけください。`
  }
  
  return templates[templateType as keyof typeof templates]
}

function generateECBody(topic: string, goal: string, templateType: string, toneInfo: any): string {
  const templates = {
    simple: `${topic}の新商品が入荷しました！

こだわりの素材と丁寧な製作で、多くのお客様にご好評いただいています。`,
    
    detailed: `${topic}の新商品が入荷しました！

こだわりの素材と丁寧な製作で、多くのお客様にご好評いただいています。一つ一つ手作業で作られているため、数量限定となっております。

品質にこだわり、長くご愛用いただける商品づくりを心がけています。`,
    
    comprehensive: `${topic}の新商品が入荷しました！

こだわりの素材と丁寧な製作で、多くのお客様にご好評いただいています。一つ一つ手作業で作られているため、数量限定となっております。

今回の商品は、お客様からのリクエストにお応えして開発いたしました。使い勝手はもちろん、デザイン性にもこだわり、普段使いからspecial なシーンまで幅広くお使いいただけます。

品質にこだわり、長くご愛用いただける商品づくりを心がけています。実際にご購入いただいたお客様からも、「期待以上の品質」「長く使えそう」といった嬉しいお声をいただいております。

在庫に限りがございますので、気になる方はお早めにチェックしてくださいね。`
  }
  
  return templates[templateType as keyof typeof templates]
}

function generateCreatorBody(topic: string, goal: string, templateType: string, toneInfo: any): string {
  const templates = {
    simple: `${topic}について制作過程をシェアします。

今回は新しい技法にチャレンジしてみました。試行錯誤の連続でしたが、納得のいく作品に仕上がりました。`,
    
    detailed: `${topic}について制作過程をシェアします。

今回は新しい技法にチャレンジしてみました。試行錯誤の連続でしたが、納得のいく作品に仕上がりました。

制作期間は約1週間。細部までこだわり抜いた結果、自分でも驚くほど表現力のある作品になりました。`,
    
    comprehensive: `${topic}について制作過程をシェアします。

今回は新しい技法にチャレンジしてみました。試行錯誤の連続でしたが、納得のいく作品に仕上がりました。

制作期間は約1週間。最初はうまくいかず、何度も作り直しました。でも、その分だけ新しい発見があり、技術的にも大きく成長できたと感じています。

特に色彩の表現では、これまでとは違うアプローチを取り入れました。光の当たり方や影の落ち方を意識して、より立体感のある仕上がりを目指しました。

細部までこだわり抜いた結果、自分でも驚くほど表現力のある作品になりました。見る角度によって印象が変わるのも、今回の特徴の一つです。

創作活動は決して楽な道のりではありませんが、完成した時の達成感は何物にも代えがたいものがあります。`
  }
  
  return templates[templateType as keyof typeof templates]
}

function generateLocalBody(topic: string, goal: string, templateType: string, toneInfo: any): string {
  const templates = {
    simple: `地域の${topic}について紹介します。

地元の方にも観光の方にもおすすめのスポットです。ぜひ一度足を運んでみてください。`,
    
    detailed: `地域の${topic}について紹介します。

地元の方にも観光の方にもおすすめのスポットです。特に週末は多くの方で賑わっています。

アクセスも良好で、駐車場も完備されているので、お車でのお越しも安心です。`,
    
    comprehensive: `地域の${topic}について紹介します。

地元の方にも観光の方にもおすすめのスポットです。特に週末は多くの方で賑わっていますが、平日の午前中は比較的ゆっくりとお楽しみいただけます。

こちらの魅力は、なんといってもその歴史と伝統。長年にわたって地域の皆様に愛され続けてきた背景には、確かな理由があります。

アクセスも良好で、最寄り駅から徒歩約10分。駐車場も完備されているので、お車でのお越しも安心です。公共交通機関をご利用の場合は、○○線○○駅が最寄りとなります。

地域の活性化にも貢献しており、地元の食材を使った限定メニューなども楽しめます。季節ごとに異なるイベントも開催されているので、何度訪れても新しい発見があります。`
  }
  
  return templates[templateType as keyof typeof templates]
}

function generateGenericBody(topic: string, goal: string, templateType: string, toneInfo: any): string {
  const templates = {
    simple: `${topic}について情報をお伝えします。

多くの方にとって有益な内容だと思いますので、ぜひ参考にしてください。`,
    
    detailed: `${topic}について情報をお伝えします。

多くの方にとって有益な内容だと思いますので、ぜひ参考にしてください。詳しい内容については、随時更新していく予定です。

ご質問やご要望があれば、お気軽にお声がけください。`,
    
    comprehensive: `${topic}について情報をお伝えします。

多くの方にとって有益な内容だと思いますので、ぜひ参考にしてください。このテーマについては、以前からたくさんの方にご質問をいただいており、今回まとめてお答えする機会をいただきました。

詳しい内容については、随時更新していく予定です。新しい情報が入り次第、こちらでもシェアさせていただきます。

また、個別のご相談についても承っておりますので、遠慮なくお声がけください。皆様のお役に立てるよう、これからも有益な情報発信を続けてまいります。

ご質問やご要望があれば、コメントやメッセージでお気軽にお声がけください。`
  }
  
  return templates[templateType as keyof typeof templates]
}

function extendBody(body: string, toneInfo: any, templateType: string): string {
  const extensions = [
    '\n\n皆様のご意見もお聞かせください。',
    '\n\n何かご不明な点があれば、遠慮なくお声がけくださいね。',
    '\n\n今後ともよろしくお願いいたします。',
    '\n\n引き続き、有益な情報をお届けしてまいります。'
  ]
  
  if (toneInfo.emoji) {
    return body + extensions[0] + ' ✨'
  }
  
  return body + extensions[Math.floor(Math.random() * extensions.length)]
}

function trimBody(body: string, maxLength: number): string {
  if (body.length <= maxLength) return body
  
  // 文境界で切る
  const sentences = body.split('。')
  let result = ''
  
  for (const sentence of sentences) {
    if ((result + sentence + '。').length <= maxLength) {
      result += sentence + '。'
    } else {
      break
    }
  }
  
  return result || body.substring(0, maxLength - 3) + '...'
}