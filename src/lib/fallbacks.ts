// フォールバック用のシードデータ
export const seedData = {
  presets: {
    creator: {
      hooks: [
        "作品公開。制作の裏側を30秒で。",
        "Before→After、どっちが好き？",
        "この一手で仕上がりが変わる。",
        "3つのポイントで進行がラクに。",
        "今日の実績、サクッと置いときます。"
      ],
      ctas: [
        "プロフィールのリンクからポートフォリオへ。",
        "DMで「相談」と送ってください。返信します。",
        "今週までのモニター募集、残り3枠。",
        "コメントに『知りたい』でOK。",
        "ストーリーのリンクから詳細へ。"
      ],
      hashtags6: ["#制作実績", "#クリエイター", "#デザイン", "#今日の作品", "#ポートフォリオ", "#依頼受付中"]
    },
    salon: {
      hooks: [
        "空き枠、今日ご案内できます。",
        "はじめてでもムリなく続ける自己ケア。",
        "今週の推しメニューだけ書いておきます。",
        "雨の日こそ、ゆったりケア。",
        "迷ったらこのコース。失敗しない選び方。"
      ],
      ctas: [
        "プロフィールの予約フォーム→『初回希望』と一言。",
        "DMで『相談』と送ってください。空き枠をご案内。",
        "今週まで特典あり。詳細はストーリー。",
        "リンクからメニュー一覧→そのまま予約。",
        "コメントで質問OK。すぐ返信。"
      ],
      hashtags6: ["#サロン", "#美容サロン", "#初回相談", "#今日の空き枠", "#ご褒美時間", "#ケア習慣"]
    },
    ec: {
      hooks: [
        "新作でました。まずは手に取ってほしい一品。",
        "再入荷。待ってくれてありがとう。",
        "3つのこだわり、短く話します。",
        "使うほど'好き'が増える理由。",
        "発送開始。週末に間に合います。"
      ],
      ctas: [
        "プロフィールのリンク→商品ページへ。",
        "DMで商品名を送ってください。詳しく案内。",
        "今週まで送料無料。詳細はストーリー。",
        "再入荷通知は『通知希望』でOK。",
        "レビューは固定コメントにまとめました。"
      ],
      hashtags6: ["#ハンドメイド", "#EC", "#新作", "#再入荷", "#オンラインショップ", "#お迎え募集"]
    },
    local: {
      hooks: [
        "保存版。今週行けるスポット。",
        "子連れOK、助かった場所だけ。",
        "雨の日でも大丈夫な遊び場。",
        "今週の無料イベント、3つ厳選。",
        "知らないと損な制度、1分で。"
      ],
      ctas: [
        "ストーリーのリンクから地図へ。",
        "DMで『地域情報』と送ると一覧を返信。",
        "コメントに質問どうぞ。現地の実感で答えます。",
        "保存して週末に見返してね。",
        "シェア歓迎。助かったら❤️で教えてください。"
      ],
      hashtags6: ["#地域ママ", "#おでかけ", "#週末情報", "#子連れOK", "#イベント情報", "#暮らしメモ"]
    },
    other: {
      hooks: [
        "今日の情報、まとめておきます。",
        "知っておくと便利なこと。",
        "シンプルだけど効果的な方法。",
        "忘れがちだけど大切なポイント。",
        "短時間でできる改善策。"
      ],
      ctas: [
        "詳細はプロフィールのリンクから。",
        "質問はDMでお気軽にどうぞ。",
        "コメントでご意見お聞かせください。",
        "保存して後で見返してくださいね。",
        "参考になったらシェアお願いします。"
      ],
      hashtags6: ["#情報", "#お知らせ", "#今日の投稿", "#参考情報", "#シェア", "#保存推奨"]
    }
  }
}

// フォールバック関数
export function getFallbackHooks(industry: string, topic: string): string[] {
  const preset = seedData.presets[industry as keyof typeof seedData.presets] || seedData.presets.other
  return [...preset.hooks]
}

export function getFallbackCTAs(industry: string, path: string, topic: string): string[] {
  const preset = seedData.presets[industry as keyof typeof seedData.presets] || seedData.presets.other
  return [...preset.ctas]
}

export function getFallbackHashtags(industry: string, topic: string): string[] {
  const preset = seedData.presets[industry as keyof typeof seedData.presets] || seedData.presets.other
  return [...preset.hashtags6]
}

export function getFallbackCaption(
  industry: string,
  tone: string,
  topic: string,
  length: string
): {
  text: string,
  parts: {
    hook: string,
    body: string,
    cta: string,
    hashtags: string[]
  }
}[] {
  const preset = seedData.presets[industry as keyof typeof seedData.presets] || seedData.presets.other
  
  const hook = preset.hooks[0]
  const cta = preset.ctas[0]
  const hashtags = preset.hashtags6
  
  let body = ""
  switch (length) {
    case 'short':
      body = `${topic}について、簡潔にお伝えします。\n\n皆様のお役に立てる情報をお届けできるよう心がけています。`
      break
    case 'mid':
      body = `${topic}について、詳しくご説明します。\n\n日頃から多くの方にご質問をいただく内容ですので、今回まとめてお答えします。皆様のお役に立てる情報をお届けできるよう心がけています。\n\nご不明な点があれば、お気軽にお声がけください。`
      break
    case 'long':
      body = `${topic}について、詳しくご説明させていただきます。\n\n日頃から多くの方にご質問をいただく内容ですので、今回まとめてお答えします。\n\nこの内容については、長年の経験と実績に基づいてお伝えしています。皆様のお役に立てる情報をお届けできるよう、常に最新の情報を収集し、わかりやすくお伝えすることを心がけています。\n\n今後も皆様にとって価値のある情報発信を続けてまいります。ご不明な点があれば、いつでもお気軽にお声がけください。`
      break
  }
  
  const fullText = `${hook}\n\n${body}\n\n${cta}\n\n${hashtags.join(' ')}`
  
  return [{
    text: fullText,
    parts: {
      hook,
      body,
      cta,
      hashtags
    }
  }]
}