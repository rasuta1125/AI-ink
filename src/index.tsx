import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { hookRoutes } from './routes/hooks'
import { ctaRoutes } from './routes/ctas'
import { hashtagRoutes } from './routes/hashtags'
import { captionRoutes } from './routes/captions'
import { repliesRoutes } from './routes/replies'

const app = new Hono()

// CORS設定
app.use('/api/*', cors())

// API ルート
app.route('/api/hooks', hookRoutes)
app.route('/api/ctas', ctaRoutes)
app.route('/api/hashtags', hashtagRoutes)
app.route('/api/captions', captionRoutes)
app.route('/api/replies', repliesRoutes)

// メインページ
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AIコピー生成ink - 今日の投稿、ここからコピペで終わり。</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e'
                  },
                  accent: {
                    50: '#fefce8',
                    100: '#fef9c3',
                    200: '#fef08a',
                    300: '#fde047',
                    400: '#facc15',
                    500: '#eab308',
                    600: '#ca8a04',
                    700: '#a16207',
                    800: '#854d0e',
                    900: '#713f12'
                  }
                },
                animation: {
                  'fade-in': 'fadeIn 0.5s ease-in-out',
                  'slide-up': 'slideUp 0.3s ease-out',
                  'bounce-soft': 'bounceSoft 0.6s ease-in-out',
                  'pulse-soft': 'pulseSoft 2s infinite'
                },
                keyframes: {
                  fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                  },
                  slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                  },
                  bounceSoft: {
                    '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
                    '40%, 43%': { transform: 'translateY(-8px)' },
                    '70%': { transform: 'translateY(-4px)' },
                    '90%': { transform: 'translateY(-2px)' }
                  },
                  pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' }
                  }
                },
                boxShadow: {
                  'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                  'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
                }
              }
            }
          }
        </script>
        <style>
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .btn-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
          }
          
          .btn-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
          }
          
          .feature-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .feature-card:hover {
            transform: translateY(-4px);
          }
          
          .input-focus:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .result-item {
            transition: all 0.2s ease;
          }
          
          .result-item:hover {
            background-color: rgba(59, 130, 246, 0.05);
            border-color: rgba(59, 130, 246, 0.2);
          }
          
          .copy-success {
            animation: bounceSoft 0.6s ease-in-out;
          }

          .tutorial-highlight {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1); }
          }
        </style>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <!-- ナビゲーションバー -->
        <nav class="bg-white bg-opacity-80 backdrop-blur-md border-b border-white border-opacity-20 sticky top-0 z-40">
            <div class="container mx-auto px-4 py-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <h1 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-magic text-primary-500 mr-2"></i>
                            AIコピー生成ink
                        </h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <!-- 残回数バッジ -->
                        <div id="usageBadge" class="hidden">
                            <div class="flex items-center bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200">
                                <i class="fas fa-chart-line text-blue-600 mr-2 text-sm"></i>
                                <span class="text-sm font-medium text-gray-700">
                                    残 <span id="remainingCount" class="font-bold text-blue-600">--</span> / <span id="totalLimit" class="text-gray-500">--</span>
                                </span>
                                <span id="planBadge" class="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">FREE</span>
                            </div>
                        </div>
                        
                        <a href="/reply-bot" class="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center transition-colors">
                            <i class="fas fa-robot mr-2"></i>
                            返信ボット
                        </a>
                        <button id="guideBtn" class="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                            <i class="fas fa-question-circle mr-2"></i>
                            使い方ガイド
                        </button>
                        <button id="tutorialBtn" class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <i class="fas fa-graduation-cap mr-2"></i>
                            初回チュートリアル
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- ヘッダー -->
        <header class="relative overflow-hidden">
            <div class="absolute inset-0 gradient-bg opacity-90"></div>
            <div class="relative container mx-auto px-4 py-16 text-center text-white">
                <div class="animate-fade-in">
                    <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        <i class="fas fa-magic mr-4 text-accent-300 animate-pulse-soft"></i>
                        AIコピー生成ink
                    </h1>
                    <div class="space-y-3 mb-8">
                        <p class="text-2xl md:text-3xl font-semibold text-accent-100">
                            今日の投稿、ここからコピペで終わり。
                        </p>
                        <p class="text-xl md:text-2xl text-blue-100">
                            Hook・CTA・ハッシュタグ。迷わない3ボタン。
                        </p>
                        <p class="text-lg text-blue-200">
                            考える前に出す。言葉のショートカット。
                        </p>
                    </div>
                    
                    <!-- 対象ユーザー表示 -->
                    <div class="flex flex-wrap justify-center gap-3 mt-8">
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-palette mr-1"></i>クリエイター
                        </span>
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-spa mr-1"></i>個人サロン
                        </span>
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-shopping-cart mr-1"></i>個人EC
                        </span>
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-map-marker-alt mr-1"></i>地域発信
                        </span>
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-user mr-1"></i>フリーランス
                        </span>
                    </div>
                </div>
            </div>
        </header>

        <!-- メインコンテンツ -->
        <main class="container mx-auto px-4 py-12">
            <!-- クイックスタートガイド -->
            <div id="quickStart" class="glass-effect rounded-2xl shadow-soft-lg p-8 mb-12 animate-slide-up">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <div class="bg-green-100 p-3 rounded-lg mr-4">
                            <i class="fas fa-rocket text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">クイックスタート</h2>
                            <p class="text-gray-600">3ステップで今すぐ使えます</p>
                        </div>
                    </div>
                    <button id="hideQuickStart" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                        <div class="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                        <h3 class="font-semibold text-gray-800 mb-2">設定入力</h3>
                        <p class="text-sm text-gray-600">目標・業種・トーン・トピックを選択</p>
                    </div>
                    <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                        <div class="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                        <h3 class="font-semibold text-gray-800 mb-2">機能選択</h3>
                        <p class="text-sm text-gray-600">4つのボタンから必要な機能をクリック</p>
                    </div>
                    <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <div class="bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                        <h3 class="font-semibold text-gray-800 mb-2">コピー＆投稿</h3>
                        <p class="text-sm text-gray-600">結果をクリックしてSNSに投稿</p>
                    </div>
                </div>
            </div>

            <!-- 設定パネル -->
            <div id="settingsPanel" class="glass-effect rounded-2xl shadow-soft-lg p-8 mb-12 animate-slide-up">
                <div class="flex items-center mb-8">
                    <div class="bg-primary-100 p-3 rounded-lg mr-4">
                        <i class="fas fa-cog text-primary-600 text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold text-gray-800">コンテンツ設定</h2>
                        <p class="text-gray-600">あなたの投稿に最適化されたコピーを生成します</p>
                    </div>
                    <button id="settingsHelp" class="text-primary-500 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50">
                        <i class="fas fa-question-circle text-xl"></i>
                    </button>
                </div>
                
                <form id="contentForm" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- 目標 -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-target mr-2 text-primary-500"></i>目標
                            <span class="text-xs text-gray-500 ml-2">何を達成したい？</span>
                        </label>
                        <select id="goal" name="goal" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="認知">認知拡大 - 知ってもらう</option>
                            <option value="保存">保存促進 - 保存してもらう</option>
                            <option value="CV">コンバージョン - 行動してもらう</option>
                        </select>
                    </div>

                    <!-- 業種 -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-briefcase mr-2 text-primary-500"></i>業種
                            <span class="text-xs text-gray-500 ml-2">あなたの事業分野</span>
                        </label>
                        <select id="industry" name="industry" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="creator">クリエイター - デザイン・アート</option>
                            <option value="salon">個人サロン - 美容・エステ</option>
                            <option value="ec">個人EC - ハンドメイド・物販</option>
                            <option value="local">地域発信 - 地域情報・イベント</option>
                            <option value="other">その他 - 一般的な投稿</option>
                        </select>
                    </div>

                    <!-- トーン -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-comment mr-2 text-primary-500"></i>トーン
                            <span class="text-xs text-gray-500 ml-2">話し方のスタイル</span>
                        </label>
                        <select id="tone" name="tone" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="フレンドリー">フレンドリー - 親しみやすく</option>
                            <option value="専門家">専門家 - 信頼できる専門的に</option>
                            <option value="エモい">エモい - 感情的で共感を呼ぶ</option>
                            <option value="きっぱり">きっぱり - 断定的で力強く</option>
                        </select>
                    </div>

                    <!-- 導線 -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-arrow-right mr-2 text-primary-500"></i>導線
                            <span class="text-xs text-gray-500 ml-2">どこに誘導する？</span>
                        </label>
                        <select id="path" name="path" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="プロフィール">プロフィール - プロフ詳細へ</option>
                            <option value="リンク">リンク - 外部サイトへ</option>
                            <option value="DM">DM - ダイレクトメッセージへ</option>
                            <option value="フォーム">フォーム - 申込みフォームへ</option>
                        </select>
                    </div>

                    <!-- トピック -->
                    <div class="md:col-span-2 lg:col-span-3 space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-lightbulb mr-2 text-primary-500"></i>トピック
                            <span class="text-xs text-gray-500 font-normal">（何について投稿するか - 100文字以内）</span>
                        </label>
                        <input type="text" id="topic" name="topic" maxlength="100" 
                               placeholder="例：空き枠案内、新サービス紹介、キャンペーン告知、新作商品発表" 
                               class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                        <div class="text-xs text-gray-500 mt-1 flex justify-between">
                            <span>具体的なテーマを入力してください</span>
                            <span><span id="topicCounter">0</span>/100文字</span>
                        </div>
                    </div>

                    <!-- 期限 -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-clock mr-2 text-primary-500"></i>期限
                            <span class="text-xs text-gray-500 ml-2">いつまで？</span>
                        </label>
                        <select id="deadline" name="deadline" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="なし">期限なし - いつでも</option>
                            <option value="今週中">今週中 - 急ぎ</option>
                            <option value="今月中">今月中 - そろそろ</option>
                        </select>
                    </div>
                </form>
            </div>

            <!-- 生成ボタンエリア -->
            <div id="functionsPanel" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <!-- Hookメーカー -->
                <div class="feature-card glass-effect rounded-2xl shadow-soft p-8 text-center">
                    <div class="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-fish text-3xl text-orange-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">Hook メーカー</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        <strong>引きの1行を5パターン</strong><br>
                        <span class="text-xs text-gray-500">数字・質問・逆説・ギャップ・事実の5系統</span>
                    </p>
                    <div class="text-xs text-gray-600 mb-4 p-3 bg-orange-50 rounded-lg">
                        <div class="flex items-center mb-1">
                            <i class="fas fa-lightbulb text-orange-500 mr-2"></i>
                            <strong>こんな時に：</strong>
                        </div>
                        スクロールを止めるキャッチーな冒頭文が欲しい
                    </div>
                    <button id="generateHooks" class="btn-gradient w-full text-white font-semibold py-4 px-6 rounded-xl">
                        <i class="fas fa-magic mr-2"></i>Hook を生成
                    </button>
                </div>

                <!-- CTAビルダー -->
                <div class="feature-card glass-effect rounded-2xl shadow-soft p-8 text-center">
                    <div class="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-bullhorn text-3xl text-green-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">CTA ビルダー</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        <strong>行動喚起を5パターン</strong><br>
                        <span class="text-xs text-gray-500">動詞＋場所＋期限で構成</span>
                    </p>
                    <div class="text-xs text-gray-600 mb-4 p-3 bg-green-50 rounded-lg">
                        <div class="flex items-center mb-1">
                            <i class="fas fa-lightbulb text-green-500 mr-2"></i>
                            <strong>こんな時に：</strong>
                        </div>
                        読者に具体的なアクションを促したい
                    </div>
                    <button id="generateCTAs" class="btn-gradient w-full text-white font-semibold py-4 px-6 rounded-xl">
                        <i class="fas fa-bullhorn mr-2"></i>CTA を生成
                    </button>
                </div>

                <!-- #タグ6 -->
                <div class="feature-card glass-effect rounded-2xl shadow-soft p-8 text-center">
                    <div class="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-hashtag text-3xl text-purple-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">#タグ6</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        <strong>最適なハッシュタグ6個</strong><br>
                        <span class="text-xs text-gray-500">汎用2・カテゴリ2・ニッチ2</span>
                    </p>
                    <div class="text-xs text-gray-600 mb-4 p-3 bg-purple-50 rounded-lg">
                        <div class="flex items-center mb-1">
                            <i class="fas fa-lightbulb text-purple-500 mr-2"></i>
                            <strong>こんな時に：</strong>
                        </div>
                        リーチを広げて発見されやすくしたい
                    </div>
                    <button id="generateHashtags" class="btn-gradient w-full text-white font-semibold py-4 px-6 rounded-xl">
                        <i class="fas fa-hashtag mr-2"></i>タグを生成
                    </button>
                </div>

                <!-- フル本文 -->
                <div class="feature-card glass-effect rounded-2xl shadow-soft p-8 text-center">
                    <div class="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-file-alt text-3xl text-blue-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">フル本文</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        <strong>完全版を3パターン</strong><br>
                        <span class="text-xs text-gray-500">Hook→本文→CTA→ハッシュタグ</span>
                    </p>
                    <div class="text-xs text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
                        <div class="flex items-center mb-1">
                            <i class="fas fa-lightbulb text-blue-500 mr-2"></i>
                            <strong>こんな時に：</strong>
                        </div>
                        投稿全体を一括で作りたい
                    </div>
                    <div class="mb-4">
                        <select id="length" class="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 input-focus">
                            <option value="short">短文 (120-180字) - サクッと読める</option>
                            <option value="mid">中文 (200-350字) - 丁度よい分量</option>
                            <option value="long">長文 (400-600字) - 詳しく説明</option>
                        </select>
                    </div>
                    <button id="generateCaptions" class="btn-gradient w-full text-white font-semibold py-4 px-6 rounded-xl">
                        <i class="fas fa-file-alt mr-2"></i>本文を生成
                    </button>
                </div>
            </div>

            <!-- 結果表示エリア -->
            <div id="results" class="hidden animate-slide-up">
                <div class="glass-effect rounded-2xl shadow-soft-lg p-8">
                    <div class="flex justify-between items-center mb-8">
                        <div class="flex items-center">
                            <div class="bg-primary-100 p-3 rounded-lg mr-4">
                                <i class="fas fa-clipboard-list text-primary-600 text-xl"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800">生成結果</h2>
                                <p class="text-gray-600">
                                    <i class="fas fa-info-circle text-primary-500 mr-2"></i>
                                    クリックするとクリップボードにコピーされます
                                </p>
                            </div>
                        </div>
                        <button id="clearResults" class="text-red-500 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                            <i class="fas fa-times mr-2"></i>クリア
                        </button>
                    </div>
                    <div id="resultsContent"></div>
                </div>
            </div>


        </main>

        <!-- 使い方ガイドモーダル -->
        <div id="guideModal" class="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="glass-effect rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-3xl font-bold text-gray-800">
                            <i class="fas fa-book text-primary-500 mr-3"></i>
                            使い方ガイド
                        </h2>
                        <button id="closeGuide" class="text-gray-400 hover:text-gray-600 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- 各機能の説明 -->
                    <div class="space-y-8">
                        <!-- Hook メーカー -->
                        <div class="border border-orange-200 bg-orange-50 rounded-xl p-6">
                            <div class="flex items-center mb-4">
                                <div class="bg-orange-100 p-3 rounded-lg mr-4">
                                    <i class="fas fa-fish text-orange-600 text-xl"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800">Hook メーカー</h3>
                            </div>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-2">📝 何をするの？</h4>
                                    <p class="text-sm text-gray-700 mb-4">投稿の最初に読者の注意を引く「フック」を5パターン生成します。</p>
                                    
                                    <h4 class="font-semibold text-gray-800 mb-2">🎯 いつ使う？</h4>
                                    <ul class="text-sm text-gray-700 space-y-1 mb-4">
                                        <li>• スクロールを止めるキャッチーな冒頭文が欲しい</li>
                                        <li>• 「何を書こう？」から脱出したい</li>
                                        <li>• 複数のパターンから選びたい</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-2">💡 生成される5つの系統</h4>
                                    <div class="space-y-2 text-sm">
                                        <div class="bg-white p-2 rounded border-l-4 border-orange-400">
                                            <strong>数字系：</strong>「3つの理由で...」「24時間で...」
                                        </div>
                                        <div class="bg-white p-2 rounded border-l-4 border-orange-400">
                                            <strong>質問系：</strong>「...って知ってる？」「なぜ...？」
                                        </div>
                                        <div class="bg-white p-2 rounded border-l-4 border-orange-400">
                                            <strong>逆説系：</strong>「実は...は間違い？」「常識を覆す...」
                                        </div>
                                        <div class="bg-white p-2 rounded border-l-4 border-orange-400">
                                            <strong>ギャップ系：</strong>「まさかの...」「見た目は...だが...」
                                        </div>
                                        <div class="bg-white p-2 rounded border-l-4 border-orange-400">
                                            <strong>事実系：</strong>「今日の...」「リアルな...」
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- CTA ビルダー -->
                        <div class="border border-green-200 bg-green-50 rounded-xl p-6">
                            <div class="flex items-center mb-4">
                                <div class="bg-green-100 p-3 rounded-lg mr-4">
                                    <i class="fas fa-bullhorn text-green-600 text-xl"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800">CTA ビルダー</h3>
                            </div>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-2">📝 何をするの？</h4>
                                    <p class="text-sm text-gray-700 mb-4">読者に具体的な行動を促す「行動喚起」を5パターン生成します。</p>
                                    
                                    <h4 class="font-semibold text-gray-800 mb-2">🎯 いつ使う？</h4>
                                    <ul class="text-sm text-gray-700 space-y-1 mb-4">
                                        <li>• 読者に次のアクションをして欲しい</li>
                                        <li>• プロフィールやDMに誘導したい</li>
                                        <li>• 曖昧な終わり方を避けたい</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-2">🏗️ CTA の構造</h4>
                                    <div class="bg-white p-4 rounded border-l-4 border-green-400 mb-4">
                                        <div class="text-center text-lg font-mono">
                                            <span class="bg-blue-100 px-2 py-1 rounded">動詞</span>
                                            <span class="mx-2">+</span>
                                            <span class="bg-purple-100 px-2 py-1 rounded">場所</span>
                                            <span class="mx-2">+</span>
                                            <span class="bg-orange-100 px-2 py-1 rounded">期限</span>
                                        </div>
                                        <p class="text-xs text-gray-600 mt-2 text-center">
                                            例：「チェック」＋「プロフィール」＋「今週中」
                                        </p>
                                    </div>
                                    <h4 class="font-semibold text-gray-800 mb-2">✅ 導線設定のコツ</h4>
                                    <ul class="text-xs text-gray-600 space-y-1">
                                        <li>• プロフィール：詳細情報を見て欲しい</li>
                                        <li>• リンク：外部サイトに誘導したい</li>
                                        <li>• DM：個別相談を受け付けたい</li>
                                        <li>• フォーム：申込みを受け付けたい</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- ハッシュタグ -->
                        <div class="border border-purple-200 bg-purple-50 rounded-xl p-6">
                            <div class="flex items-center mb-4">
                                <div class="bg-purple-100 p-3 rounded-lg mr-4">
                                    <i class="fas fa-hashtag text-purple-600 text-xl"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800">#タグ6</h3>
                            </div>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-2">📝 何をするの？</h4>
                                    <p class="text-sm text-gray-700 mb-4">投稿の発見率を上げる最適なハッシュタグを6個セットで生成します。</p>
                                    
                                    <h4 class="font-semibold text-gray-800 mb-2">🎯 いつ使う？</h4>
                                    <ul class="text-sm text-gray-700 space-y-1">
                                        <li>• より多くの人に投稿を見てもらいたい</li>
                                        <li>• ハッシュタグ選びに迷っている</li>
                                        <li>• バランスの良いタグ構成にしたい</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-2">⚖️ バランス配合（2:2:2）</h4>
                                    <div class="space-y-3">
                                        <div class="bg-white p-3 rounded border-l-4 border-purple-400">
                                            <strong class="text-purple-600">汎用タグ×2</strong>
                                            <p class="text-xs text-gray-600 mt-1">幅広い層にリーチ<br>例：#今日 #おすすめ #情報</p>
                                        </div>
                                        <div class="bg-white p-3 rounded border-l-4 border-purple-400">
                                            <strong class="text-purple-600">カテゴリタグ×2</strong>
                                            <p class="text-xs text-gray-600 mt-1">業種特化で確実にリーチ<br>例：#サロン #クリエイター #EC</p>
                                        </div>
                                        <div class="bg-white p-3 rounded border-l-4 border-purple-400">
                                            <strong class="text-purple-600">ニッチタグ×2</strong>
                                            <p class="text-xs text-gray-600 mt-1">トピック特化で深いリーチ<br>例：#空き枠 #新作 #イベント</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- フル本文 -->
                        <div class="border border-blue-200 bg-blue-50 rounded-xl p-6">
                            <div class="flex items-center mb-4">
                                <div class="bg-blue-100 p-3 rounded-lg mr-4">
                                    <i class="fas fa-file-alt text-blue-600 text-xl"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800">フル本文</h3>
                            </div>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-2">📝 何をするの？</h4>
                                    <p class="text-sm text-gray-700 mb-4">Hook・本文・CTA・ハッシュタグを統合した完全版の投稿を3パターン生成します。</p>
                                    
                                    <h4 class="font-semibold text-gray-800 mb-2">🎯 いつ使う？</h4>
                                    <ul class="text-sm text-gray-700 space-y-1">
                                        <li>• 投稿全体を一括で作りたい</li>
                                        <li>• 統一感のある投稿にしたい</li>
                                        <li>• そのままコピペして投稿したい</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-800 mb-2">📏 文字数の目安</h4>
                                    <div class="space-y-2 text-sm">
                                        <div class="bg-white p-3 rounded border-l-4 border-blue-400">
                                            <strong>短文（120-180字）</strong>
                                            <p class="text-xs text-gray-600 mt-1">Twitter・Instagram ストーリー向け<br>サクッと読めてシェアされやすい</p>
                                        </div>
                                        <div class="bg-white p-3 rounded border-l-4 border-blue-400">
                                            <strong>中文（200-350字）</strong>
                                            <p class="text-xs text-gray-600 mt-1">Instagram フィード・Facebook 向け<br>程よい情報量で読みやすい</p>
                                        </div>
                                        <div class="bg-white p-3 rounded border-l-4 border-blue-400">
                                            <strong>長文（400-600字）</strong>
                                            <p class="text-xs text-gray-600 mt-1">ブログ・LinkedIn 向け<br>詳しい説明で信頼性アップ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- よくある質問 -->
                    <div class="mt-12 pt-8 border-t border-gray-200">
                        <h3 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-question-circle text-primary-500 mr-3"></i>
                            よくある質問
                        </h3>
                        <div class="grid md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-gray-800 mb-2">💡 どの順番で使えばいい？</h4>
                                    <p class="text-sm text-gray-600">最初は「Hook」「CTA」「#タグ」を個別に試して、慣れたら「フル本文」で一括生成がおすすめです。</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-gray-800 mb-2">🔧 設定を変えるとどうなる？</h4>
                                    <p class="text-sm text-gray-600">業種・トーン・目標を変えると、生成される文章のスタイルや内容が大きく変わります。</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-gray-800 mb-2">📱 モバイルでも使える？</h4>
                                    <p class="text-sm text-gray-600">はい！スマートフォンやタブレットでも快適に使えるレスポンシブデザインです。</p>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-gray-800 mb-2">🔐 生成されたテキストの使用は自由？</h4>
                                    <p class="text-sm text-gray-600">はい！商用・非商用問わず自由にご利用いただけます。編集も自由です。</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-gray-800 mb-2">⚡ 生成に時間がかかる時は？</h4>
                                    <p class="text-sm text-gray-600">API接続中の場合は数秒かかることがあります。フォールバック機能により必ず結果が表示されます。</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-gray-800 mb-2">💡 より良い結果を得るコツは？</h4>
                                    <p class="text-sm text-gray-600">トピックは具体的に！「新サービス」より「初回カウンセリング無料」の方が良い結果が得られます。</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 text-center">
                        <button id="startTutorial" class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                            <i class="fas fa-graduation-cap mr-2"></i>
                            初回チュートリアルを開始
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ローディングオーバーレイ -->
        <div id="loading" class="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="glass-effect rounded-2xl p-8 max-w-sm mx-4 text-center">
                <div class="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-6"></div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">生成中...</h3>
                <p class="text-gray-600">AI がコンテンツを作成しています</p>
                <div class="mt-4 bg-gray-200 rounded-full h-2">
                    <div class="bg-primary-500 h-2 rounded-full animate-pulse" style="width: 65%"></div>
                </div>
            </div>
        </div>

        <!-- 成功通知 -->
        <div id="successToast" class="hidden fixed top-20 right-4 z-50">
            <div class="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-slide-up">
                <i class="fas fa-check-circle mr-3 text-xl"></i>
                <span>クリップボードにコピーしました！</span>
            </div>
        </div>

        <!-- Firebase SDK v8 (互換性重視) -->
        <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
        
        <!-- Firebase設定 -->
        <script src="/firebase-config.js"></script>

        <!-- Firebase SDK v10 (モダン版) - 将来の移行用に保持 -->
        <script type="module">
          // Firebase設定
          import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
          import { 
            getAuth, 
            signInWithEmailAndPassword, 
            createUserWithEmailAndPassword,
            signInWithPopup,
            GoogleAuthProvider,
            onAuthStateChanged, 
            getIdToken,
            signOut 
          } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

          // Firebase設定（環境変数 or フォールバック）
          const firebaseConfig = {
            apiKey: import.meta?.env?.VITE_FIREBASE_API_KEY || "AlzaSyAy-IH56f2DtXPp5wXIWGaY_vIiaoVVbyuM",
            authDomain: import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN || "aiink-231e7.firebaseapp.com",
            projectId: import.meta?.env?.VITE_FIREBASE_PROJECT_ID || "aiink-231e7",
            appId: import.meta?.env?.VITE_FIREBASE_APP_ID || "1:198276519701:web:c5e8f7a8b9d1e2f3g4h5i6j7"
          };
          
          console.log('🔥 Firebase Config Source:', import.meta?.env?.VITE_FIREBASE_API_KEY ? 'Environment Variables' : 'Hardcoded');

          const app = initializeApp(firebaseConfig);
          const auth = getAuth(app);
          const googleProvider = new GoogleAuthProvider();

          // グローバルにアクセス可能にする（v10版）
          window.firebaseAuth = {
            auth,
            signInWithEmailAndPassword: (email, password) => signInWithEmailAndPassword(auth, email, password),
            createUserWithEmailAndPassword: (email, password) => createUserWithEmailAndPassword(auth, password),
            signInWithPopup: () => signInWithPopup(auth, googleProvider),
            signOut: () => signOut(auth),
            onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
            getIdToken: () => getIdToken(auth.currentUser, true)
          };
        </script>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // グローバル状態
            let currentResults = {
                hooks: null,
                ctas: null,
                hashtags: null,
                captions: null
            };

            let tutorialActive = false;
            let tutorialStep = 0;

            // DOM要素の取得
            const elements = {
                loading: document.getElementById('loading'),
                results: document.getElementById('results'),
                resultsContent: document.getElementById('resultsContent'),
                successToast: document.getElementById('successToast'),
                topicInput: document.getElementById('topic'),
                topicCounter: document.getElementById('topicCounter'),
                guideModal: document.getElementById('guideModal'),
                quickStart: document.getElementById('quickStart'),
                settingsPanel: document.getElementById('settingsPanel'),
                functionsPanel: document.getElementById('functionsPanel')
            };
            
            // 文字カウンター
            elements.topicInput.addEventListener('input', () => {
                const length = elements.topicInput.value.length;
                elements.topicCounter.textContent = length;
                elements.topicCounter.style.color = length > 90 ? '#ef4444' : length > 70 ? '#f59e0b' : '#6b7280';
            });

            // ガイドモーダル制御
            document.getElementById('guideBtn').addEventListener('click', () => {
                elements.guideModal.classList.remove('hidden');
            });

            document.getElementById('closeGuide').addEventListener('click', () => {
                elements.guideModal.classList.add('hidden');
            });

            document.getElementById('startTutorial').addEventListener('click', () => {
                elements.guideModal.classList.add('hidden');
                startTutorial();
            });

            // クイックスタート制御
            document.getElementById('hideQuickStart').addEventListener('click', () => {
                elements.quickStart.style.display = 'none';
                localStorage.setItem('hideQuickStart', 'true');
            });

            // ローカルストレージから設定を復元
            if (localStorage.getItem('hideQuickStart') === 'true') {
                elements.quickStart.style.display = 'none';
            }

            // チュートリアル機能
            function startTutorial() {
                tutorialActive = true;
                tutorialStep = 0;
                showTutorialStep();
            }

            function showTutorialStep() {
                // 既存のハイライトを削除
                document.querySelectorAll('.tutorial-highlight').forEach(el => {
                    el.classList.remove('tutorial-highlight');
                });

                const steps = [
                    {
                        element: elements.settingsPanel,
                        message: 'まずは、ここでコンテンツの設定をします。トピックに「空き枠案内」と入力してみましょう！'
                    },
                    {
                        element: document.getElementById('generateHooks'),
                        message: 'トピックを入力したら、「Hook を生成」ボタンを押してみましょう。引きのある冒頭文が5パターン生成されます！'
                    },
                    {
                        element: elements.results,
                        message: '生成された結果はここに表示されます。気に入ったものをクリックするとコピーできます。'
                    }
                ];

                if (tutorialStep < steps.length) {
                    const step = steps[tutorialStep];
                    step.element.classList.add('tutorial-highlight');
                    step.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // メッセージ表示
                    showTutorialMessage(step.message);
                    tutorialStep++;
                    
                    setTimeout(() => {
                        if (tutorialStep < steps.length) {
                            showTutorialStep();
                        } else {
                            endTutorial();
                        }
                    }, 4000);
                }
            }

            function showTutorialMessage(message) {
                // 既存のメッセージを削除
                const existingMessage = document.getElementById('tutorialMessage');
                if (existingMessage) {
                    existingMessage.remove();
                }

                // 新しいメッセージを表示
                const messageEl = document.createElement('div');
                messageEl.id = 'tutorialMessage';
                messageEl.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md text-center';
                messageEl.innerHTML = \`
                    <p class="mb-3">\${message}</p>
                    <button onclick="endTutorial()" class="bg-white text-primary-500 px-4 py-2 rounded text-sm font-medium">
                        スキップ
                    </button>
                \`;
                document.body.appendChild(messageEl);
            }

            function endTutorial() {
                tutorialActive = false;
                document.querySelectorAll('.tutorial-highlight').forEach(el => {
                    el.classList.remove('tutorial-highlight');
                });
                const messageEl = document.getElementById('tutorialMessage');
                if (messageEl) {
                    messageEl.remove();
                }
            }

            // チュートリアルボタン
            document.getElementById('tutorialBtn').addEventListener('click', startTutorial);

            // 設定ヘルプボタン
            document.getElementById('settingsHelp').addEventListener('click', () => {
                elements.guideModal.classList.remove('hidden');
            });

            // フォームデータ取得
            function getFormData() {
                return {
                    goal: document.getElementById('goal').value,
                    industry: document.getElementById('industry').value,
                    tone: document.getElementById('tone').value,
                    topic: document.getElementById('topic').value.trim(),
                    path: document.getElementById('path').value,
                    deadline: document.getElementById('deadline').value,
                    length: document.getElementById('length').value
                };
            }

            // バリデーション
            function validateForm(requiredFields = ['topic']) {
                const data = getFormData();
                for (const field of requiredFields) {
                    if (!data[field]) {
                        showError(\`\${field === 'topic' ? 'トピック' : field}を入力してください\`);
                        return false;
                    }
                }
                if (data.topic && data.topic.length > 100) {
                    showError('トピックは100文字以内で入力してください');
                    return false;
                }
                return true;
            }

            // ローディング表示/非表示
            function showLoading() {
                elements.loading.classList.remove('hidden');
            }

            function hideLoading() {
                elements.loading.classList.add('hidden');
            }

            // エラー表示
            function showError(message) {
                alert(message);
            }

            // 成功通知
            function showSuccess(message) {
                elements.successToast.querySelector('span').textContent = message;
                elements.successToast.classList.remove('hidden');
                setTimeout(() => {
                    elements.successToast.classList.add('hidden');
                }, 3000);
            }

            // 結果表示
            function showResults() {
                elements.results.classList.remove('hidden');
                elements.results.scrollIntoView({ behavior: 'smooth' });
            }

            function renderResults() {
                let html = '';
                
                if (currentResults.hooks) html += renderHooks(currentResults.hooks);
                if (currentResults.ctas) html += renderCTAs(currentResults.ctas);
                if (currentResults.hashtags) html += renderHashtags(currentResults.hashtags);
                if (currentResults.captions) html += renderCaptions(currentResults.captions);
                
                elements.resultsContent.innerHTML = html;
                showResults();
            }

            // Hook結果レンダリング
            function renderHooks(hooks) {
                return \`
                    <div class="mb-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-orange-100 p-2 rounded-lg mr-3">
                                <i class="fas fa-fish text-orange-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800">Hook（引きの1行）</h3>
                            <div class="ml-auto bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                                5パターン生成
                            </div>
                        </div>
                        <div class="grid gap-3">
                            \${hooks.map((hook, index) => \`
                                <div class="result-item p-4 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer transition-all hover:shadow-md" 
                                     onclick="copyToClipboard('\${hook.replace(/'/g, "\\'")}')">
                                    <div class="flex justify-between items-center">
                                        <div class="flex-1">
                                            <span class="inline-block bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full mr-3">
                                                \${['数字', '質問', '逆説', 'ギャップ', '事実'][index]}
                                            </span>
                                            <span class="text-gray-800">\${hook}</span>
                                        </div>
                                        <div class="flex items-center text-orange-400 ml-3">
                                            <i class="fas fa-copy"></i>
                                            <span class="text-xs ml-1">コピー</span>
                                        </div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            // CTA結果レンダリング
            function renderCTAs(ctas) {
                return \`
                    <div class="mb-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-green-100 p-2 rounded-lg mr-3">
                                <i class="fas fa-bullhorn text-green-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800">CTA（行動喚起）</h3>
                            <div class="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                5パターン生成
                            </div>
                        </div>
                        <div class="grid gap-3">
                            \${ctas.map((cta, index) => \`
                                <div class="result-item p-4 bg-green-50 border border-green-200 rounded-xl cursor-pointer transition-all hover:shadow-md" 
                                     onclick="copyToClipboard('\${cta.replace(/'/g, "\\'")}')">
                                    <div class="flex justify-between items-center">
                                        <div class="flex-1">
                                            <span class="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full mr-3">
                                                \${index + 1}
                                            </span>
                                            <span class="text-gray-800">\${cta}</span>
                                        </div>
                                        <div class="flex items-center text-green-400 ml-3">
                                            <i class="fas fa-copy"></i>
                                            <span class="text-xs ml-1">コピー</span>
                                        </div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            // ハッシュタグ結果レンダリング
            function renderHashtags(hashtags) {
                return \`
                    <div class="mb-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-purple-100 p-2 rounded-lg mr-3">
                                <i class="fas fa-hashtag text-purple-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800">ハッシュタグ（6個セット）</h3>
                            <div class="ml-auto bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                                汎用・カテゴリ・ニッチ
                            </div>
                        </div>
                        <div class="result-item p-6 bg-purple-50 border border-purple-200 rounded-xl cursor-pointer transition-all hover:shadow-md" 
                             onclick="copyToClipboard('\${hashtags.join(' ').replace(/'/g, "\\'")}')">
                            <div class="flex flex-wrap gap-3 mb-4">
                                \${hashtags.map((tag, index) => {
                                    const types = ['汎用', '汎用', 'カテゴリ', 'カテゴリ', 'ニッチ', 'ニッチ'];
                                    const colors = ['bg-gray-200 text-gray-700', 'bg-gray-200 text-gray-700', 'bg-blue-200 text-blue-700', 'bg-blue-200 text-blue-700', 'bg-purple-200 text-purple-700', 'bg-purple-200 text-purple-700'];
                                    return \`
                                        <div class="text-center">
                                            <span class="\${colors[index]} px-3 py-2 rounded-lg font-medium">\${tag}</span>
                                            <div class="text-xs text-gray-500 mt-1">\${types[index]}</div>
                                        </div>
                                    \`;
                                }).join('')}
                            </div>
                            <div class="flex justify-center text-purple-600">
                                <i class="fas fa-copy mr-2"></i>
                                <span class="text-sm">クリックして全てコピー</span>
                            </div>
                        </div>
                    </div>
                \`;
            }

            // キャプション結果レンダリング
            function renderCaptions(captions) {
                return \`
                    <div class="mb-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-blue-100 p-2 rounded-lg mr-3">
                                <i class="fas fa-file-alt text-blue-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800">フル本文（3パターン）</h3>
                            <div class="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                Hook→本文→CTA→ハッシュタグ
                            </div>
                        </div>
                        <div class="space-y-6">
                            \${captions.map((caption, index) => \`
                                <div class="border border-blue-200 rounded-xl overflow-hidden">
                                    <div class="bg-blue-100 p-4 flex justify-between items-center">
                                        <div class="flex items-center">
                                            <span class="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                                                パターン \${index + 1}
                                            </span>
                                            <span class="text-blue-700 text-sm">\${caption.text.length}文字</span>
                                            <span class="ml-4 text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">
                                                \${caption.text.length <= 180 ? '短文' : caption.text.length <= 350 ? '中文' : '長文'}
                                            </span>
                                        </div>
                                        <button onclick="copyToClipboard('\${caption.text.replace(/'/g, "\\'")}'); event.stopPropagation();" 
                                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            <i class="fas fa-copy mr-2"></i>コピー
                                        </button>
                                    </div>
                                    <div class="p-6 bg-blue-50">
                                        <pre class="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-normal">\${caption.text}</pre>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            // クリップボードにコピー
            async function copyToClipboard(text) {
                try {
                    await navigator.clipboard.writeText(text);
                    showSuccess('クリップボードにコピーしました！');
                } catch (err) {
                    console.error('コピーに失敗しました:', err);
                    showError('コピーに失敗しました');
                }
            }

            // Firebase認証付きAPI呼び出し
            async function callAPI(endpoint, data) {
                try {
                    showLoading();
                    
                    // 認証チェック
                    if (!currentUser) {
                        hideLoading();
                        showLoginModal();
                        return null;
                    }
                    
                    // Firebase IDトークンを取得
                    const idToken = await window.firebaseAuth.getIdToken();
                    if (!idToken) {
                        hideLoading();
                        showError('認証が必要です。ログインしてください。');
                        showLoginModal();
                        return null;
                    }
                    
                    const response = await axios.post(\`/api/\${endpoint}\`, data, {
                        headers: {
                            'Authorization': \`Bearer \${idToken}\`,
                            'Content-Type': 'application/json'
                        }
                    });
                    // API呼び出し成功時に利用状況を更新
                    loadUserUsage();
                    return response.data;
                } catch (error) {
                    console.error(\`API Error (\${endpoint}):\`, error);
                    
                    if (error.response?.status === 401) {
                        showError('認証エラーです。再度ログインしてください。');
                        return null;
                    } else if (error.response?.status === 402) {
                        // 利用上限超過時の処理
                        const errorData = error.response.data;
                        showUpgradePlanModal(errorData);
                        return null;
                    } else if (error.response?.status === 429) {
                        showError('リクエストが多すぎます。5秒後に再試行してください。');
                        return null;
                    }
                    
                    const message = error.response?.data?.message || error.message || 'エラーが発生しました';
                    showError(\`エラー: \${message}\`);
                    return null;
                } finally {
                    hideLoading();
                }
            }

            // イベントリスナー設定
            document.getElementById('generateHooks').addEventListener('click', async () => {
                if (!validateForm()) return;
                
                const data = getFormData();
                const result = await callAPI('hooks', {
                    goal: data.goal,
                    industry: data.industry,
                    tone: data.tone,
                    topic: data.topic
                });
                
                if (result) {
                    currentResults.hooks = result.hooks;
                    renderResults();
                }
            });

            document.getElementById('generateCTAs').addEventListener('click', async () => {
                if (!validateForm()) return;
                
                const data = getFormData();
                const result = await callAPI('ctas', {
                    goal: data.goal,
                    path: data.path,
                    deadline: data.deadline,
                    topic: data.topic
                });
                
                if (result) {
                    currentResults.ctas = result.ctas;
                    renderResults();
                }
            });

            document.getElementById('generateHashtags').addEventListener('click', async () => {
                if (!validateForm()) return;
                
                const data = getFormData();
                const result = await callAPI('hashtags6', {
                    industry: data.industry,
                    topic: data.topic
                });
                
                if (result) {
                    currentResults.hashtags = result.hashtags;
                    renderResults();
                }
            });

            document.getElementById('generateCaptions').addEventListener('click', async () => {
                if (!validateForm()) return;
                
                const data = getFormData();
                const result = await callAPI('captions', {
                    goal: data.goal,
                    industry: data.industry,
                    tone: data.tone,
                    topic: data.topic,
                    length: data.length
                });
                
                if (result) {
                    currentResults.captions = result.captions;
                    renderResults();
                }
            });

            document.getElementById('clearResults').addEventListener('click', () => {
                currentResults = { hooks: null, ctas: null, hashtags: null, captions: null };
                elements.results.classList.add('hidden');
            });

            // モーダル外クリックで閉じる
            elements.guideModal.addEventListener('click', (e) => {
                if (e.target === elements.guideModal) {
                    elements.guideModal.classList.add('hidden');
                }
            });

            // 初期化時にランダムなプレースホルダーを設定
            const placeholders = [
                "空き枠案内",
                "新サービス紹介", 
                "キャンペーン告知",
                "新作商品発表",
                "イベント告知",
                "お客様の声紹介",
                "制作実績公開",
                "今週の特別メニュー"
            ];
            
            elements.topicInput.placeholder = \`例：\${placeholders[Math.floor(Math.random() * placeholders.length)]}\`;

            // Firebase認証状態管理
            let currentUser = null;
            let userUsage = null;
            
            // 認証状態の変化を監視
            window.firebaseAuth.onAuthStateChanged((user) => {
                currentUser = user;
                updateAuthUI(user);
                if (user) {
                    // ログイン後に利用状況を取得
                    loadUserUsage();
                } else {
                    // ログアウト時に利用状況をクリア
                    hideUsageBadge();
                }
            });
            
            function updateAuthUI(user) {
                const loginSection = document.querySelector('.auth-section');
                if (!loginSection) {
                    // 認証UIが存在しない場合は作成
                    createAuthUI();
                }
                
                if (user) {
                    // ログイン済み
                    console.log('ログイン済みユーザー:', user.email);
                    hideLoginModal();
                } else {
                    // 未ログイン - 最初のAPI呼び出し時にログイン促す
                    console.log('未ログインユーザー');
                }
            }
            
            function createAuthUI() {
                // 認証モーダルをページに追加
                const authModal = document.createElement('div');
                authModal.id = 'authModal';
                authModal.className = 'hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
                authModal.innerHTML = \`
                    <div class="glass-effect rounded-2xl max-w-md w-full p-8">
                        <div class="text-center mb-8">
                            <div class="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <i class="fas fa-magic text-2xl text-primary-600"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">ログインが必要です</h2>
                            <p class="text-gray-600">AIコピー生成機能を使用するには、ログインしてください</p>
                        </div>

                        <div class="space-y-4">
                            <button onclick="loginWithGoogle()" class="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                                <i class="fab fa-google mr-2"></i>
                                Googleでログイン
                            </button>
                            
                            <div class="text-center text-gray-500 text-sm">または</div>
                            
                            <form onsubmit="loginWithEmail(event)" class="space-y-4">
                                <input type="email" id="authEmail" placeholder="メールアドレス" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                <input type="password" id="authPassword" placeholder="パスワード" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                <button type="submit" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                                    <i class="fas fa-sign-in-alt mr-2"></i>
                                    ログイン
                                </button>
                            </form>
                            
                            <div class="text-center">
                                <button onclick="toggleSignupMode()" class="text-primary-500 hover:text-primary-600 text-sm font-medium">
                                    新規アカウント作成
                                </button>
                            </div>
                        </div>
                        
                        <button onclick="hideLoginModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                \`;
                document.body.appendChild(authModal);
            }
            
            // ログインモーダル表示/非表示
            function showLoginModal() {
                const modal = document.getElementById('authModal');
                if (modal) {
                    modal.classList.remove('hidden');
                }
            }
            
            function hideLoginModal() {
                const modal = document.getElementById('authModal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            }
            
            // Googleログイン
            async function loginWithGoogle() {
                try {
                    const result = await window.firebaseAuth.signInWithPopup();
                    console.log('Googleログイン成功:', result.user.email);
                    hideLoginModal();
                } catch (error) {
                    console.error('Googleログインエラー:', error);
                    alert('Googleログインに失敗しました: ' + error.message);
                }
            }
            
            // メール/パスワードログイン
            async function loginWithEmail(event) {
                event.preventDefault();
                const email = document.getElementById('authEmail').value;
                const password = document.getElementById('authPassword').value;
                
                try {
                    const result = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
                    console.log('ログイン成功:', result.user.email);
                    hideLoginModal();
                } catch (error) {
                    console.error('ログインエラー:', error);
                    alert('ログインに失敗しました: ' + error.message);
                }
            }
            
            // 利用状況取得
            async function loadUserUsage() {
                try {
                    if (!currentUser) return;
                    
                    const idToken = await window.firebaseAuth.getIdToken();
                    const response = await axios.get('/api/me', {
                        headers: {
                            'Authorization': \`Bearer \${idToken}\`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    userUsage = response.data;
                    updateUsageBadge(userUsage);
                } catch (error) {
                    console.error('利用状況の取得に失敗:', error);
                    // エラー時はバッジを非表示
                    hideUsageBadge();
                }
            }
            
            // 利用状況バッジ更新
            function updateUsageBadge(usage) {
                if (!usage) {
                    hideUsageBadge();
                    return;
                }
                
                const badge = document.getElementById('usageBadge');
                const remainingCount = document.getElementById('remainingCount');
                const totalLimit = document.getElementById('totalLimit');
                const planBadge = document.getElementById('planBadge');
                
                if (badge && remainingCount && totalLimit && planBadge) {
                    remainingCount.textContent = usage.remaining;
                    totalLimit.textContent = usage.limit;
                    
                    // プランバッジの色とテキスト
                    planBadge.textContent = usage.plan.toUpperCase();
                    planBadge.className = 'ml-2 px-2 py-1 text-xs font-medium rounded-full';
                    
                    if (usage.plan === 'free') {
                        planBadge.className += ' bg-gray-100 text-gray-700';
                    } else if (usage.plan === 'light') {
                        planBadge.className += ' bg-blue-100 text-blue-700';
                    } else if (usage.plan === 'premium') {
                        planBadge.className += ' bg-purple-100 text-purple-700';
                    }
                    
                    // 残回数に応じて色変更
                    const usageRate = usage.used / usage.limit;
                    if (usageRate >= 0.9) {
                        remainingCount.className = 'font-bold text-red-600';
                    } else if (usageRate >= 0.7) {
                        remainingCount.className = 'font-bold text-orange-600';
                    } else {
                        remainingCount.className = 'font-bold text-blue-600';
                    }
                    
                    badge.classList.remove('hidden');
                }
            }
            
            // 利用状況バッジ非表示
            function hideUsageBadge() {
                const badge = document.getElementById('usageBadge');
                if (badge) {
                    badge.classList.add('hidden');
                }
            }
            
            // アップグレードプランモーダル表示
            function showUpgradePlanModal(errorData) {
                // 既存のモーダルがあれば削除
                const existingModal = document.getElementById('upgradePlanModal');
                if (existingModal) {
                    existingModal.remove();
                }
                
                const modal = document.createElement('div');
                modal.id = 'upgradePlanModal';
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
                modal.innerHTML = \`
                    <div class="glass-effect rounded-2xl max-w-md w-full p-8">
                        <div class="text-center mb-8">
                            <div class="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">利用上限に達しました</h2>
                            <p class="text-gray-600 mb-4">
                                \${errorData.plan === 'free' ? 'Free' : 'Light'}プランの月間利用回数（\${errorData.limit}回）を超過しました
                            </p>
                            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                                <div class="text-sm text-gray-600">
                                    <div>利用回数: \${errorData.used} / \${errorData.limit}</div>
                                    <div>リセット日: 翌月1日</div>
                                </div>
                            </div>
                        </div>

                        \${errorData.plan === 'free' ? \`
                            <div class="space-y-4">
                                <div class="border border-blue-200 bg-blue-50 rounded-lg p-6">
                                    <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-lg font-semibold text-blue-800">Lightプラン</h3>
                                        <div class="text-right">
                                            <div class="text-2xl font-bold text-blue-600">¥980</div>
                                            <div class="text-sm text-blue-600">/月</div>
                                        </div>
                                    </div>
                                    <div class="space-y-2 text-sm text-blue-700">
                                        <div class="flex items-center">
                                            <i class="fas fa-check text-blue-600 mr-2"></i>
                                            月間100回まで利用可能
                                        </div>
                                        <div class="flex items-center">
                                            <i class="fas fa-check text-blue-600 mr-2"></i>
                                            全機能フルアクセス
                                        </div>
                                        <div class="flex items-center">
                                            <i class="fas fa-check text-blue-600 mr-2"></i>
                                            優先サポート
                                        </div>
                                    </div>
                                    <button onclick="upgradeToLight()" class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                                        Lightプランにアップグレード
                                    </button>
                                </div>
                                
                                <button onclick="hideUpgradePlanModal()" class="w-full text-gray-600 hover:text-gray-800 font-medium py-2">
                                    翌月まで待つ
                                </button>
                            </div>
                        \` : \`
                            <div class="space-y-4">
                                <div class="text-center text-gray-600">
                                    <p class="mb-4">Lightプランの上限に達しました。</p>
                                    <p class="text-sm">より多くの利用が必要な場合は、Premiumプランをご検討ください。</p>
                                </div>
                                <button onclick="hideUpgradePlanModal()" class="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                                    閉じる
                                </button>
                            </div>
                        \`}
                        
                        <button onclick="hideUpgradePlanModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                \`;
                document.body.appendChild(modal);
            }
            
            function hideUpgradePlanModal() {
                const modal = document.getElementById('upgradePlanModal');
                if (modal) {
                    modal.remove();
                }
            }
            
            function upgradeToLight() {
                // TODO: 決済システム連携（PAY.JP または LemonSqueezy）
                alert('決済システム連携は今後実装予定です。\\n\\nお問い合わせから個別にご相談ください。');
                hideUpgradePlanModal();
            }
            
            // グローバル関数として公開
            window.showLoginModal = showLoginModal;
            window.hideLoginModal = hideLoginModal;
            window.loginWithGoogle = loginWithGoogle;
            window.loginWithEmail = loginWithEmail;
            window.loadUserUsage = loadUserUsage;
            window.showUpgradePlanModal = showUpgradePlanModal;
            window.hideUpgradePlanModal = hideUpgradePlanModal;
            window.upgradeToLight = upgradeToLight;

            // 初回訪問者向けのヒント表示
            if (!localStorage.getItem('firstVisit')) {
                setTimeout(() => {
                    if (confirm('初めての利用ですか？使い方ガイドを表示しますか？')) {
                        elements.guideModal.classList.remove('hidden');
                    }
                    localStorage.setItem('firstVisit', 'true');
                }, 2000);
            }
        </script>
    </body>
    </html>`)
})

// 返信ボットページ
app.get('/reply-bot', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>返信ボット - お客様対応を効率化</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <!-- Firebase SDKを環境変数から読み込み -->
        <script type="module">
          // 環境変数からFirebase設定を取得
          const firebaseConfig = {
            apiKey: "${c.env?.VITE_FIREBASE_API_KEY || 'AlzaSyAy-IH56f2DtXPp5wXIWGaY_vIiaoVVbyuM'}",
            authDomain: "${c.env?.VITE_FIREBASE_AUTH_DOMAIN || 'aiink-231e7.firebaseapp.com'}",
            projectId: "${c.env?.VITE_FIREBASE_PROJECT_ID || 'aiink-231e7'}",
            appId: "${c.env?.VITE_FIREBASE_APP_ID || '1:198276519701:web:c5e8f7a8b9d1e2f3g4h5i6j7'}"
          };

          console.log('🔥 Firebase Config:', firebaseConfig);

          // Firebase機能をインポート
          import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
          import { 
            getAuth,
            createUserWithEmailAndPassword,
            signInWithEmailAndPassword,
            signOut,
            onAuthStateChanged,
            updateProfile
          } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
          import { 
            getFirestore,
            doc,
            setDoc,
            getDoc
          } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

          // Firebaseを初期化
          const app = initializeApp(firebaseConfig);
          const auth = getAuth(app);
          const db = getFirestore(app);

          // アプリケーション状態
          let currentUser = null;
          let userKnowledge = null;

          function init() {
              onAuthStateChanged(auth, async (user) => {
                  if (user) {
                      currentUser = {
                          uid: user.uid,
                          email: user.email,
                          name: user.displayName || user.email.split('@')[0]
                      };
                      showMainApp();
                      await loadUserKnowledge();
                  } else {
                      currentUser = null;
                      showLoginScreen();
                  }
              });
              setupEventListeners();
          }

          function setupEventListeners() {
              document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
              document.getElementById('signupBtn')?.addEventListener('click', showSignupScreen);
              document.getElementById('backToLogin')?.addEventListener('click', showLoginScreen);
              document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
              document.getElementById('signupForm')?.addEventListener('submit', handleSignup);
              document.getElementById('replyTab')?.addEventListener('click', () => showTab('reply'));
              document.getElementById('knowledgeTab')?.addEventListener('click', () => showTab('knowledge'));
              document.getElementById('inquiryText')?.addEventListener('input', validateGenerateBtn);
              document.getElementById('generateBtn')?.addEventListener('click', generateReplies);
              document.getElementById('goToKnowledge')?.addEventListener('click', () => showTab('knowledge'));
              document.getElementById('knowledgeForm')?.addEventListener('submit', saveKnowledge);
          }

          async function handleLogin(e) {
              e.preventDefault();
              const email = document.getElementById('email').value;
              const password = document.getElementById('password').value;
              try {
                  await signInWithEmailAndPassword(auth, email, password);
                  console.log('✅ ログイン成功');
              } catch (error) {
                  console.error('❌ ログインエラー:', error);
                  alert("ログインに失敗しました。\\n" + error.message);
              }
          }

          async function handleLogout() {
              try {
                  await signOut(auth);
                  console.log('✅ ログアウト成功');
              } catch (error) {
                  console.error('❌ ログアウトエラー:', error);
              }
          }

          function showLoginScreen() {
              document.getElementById('loginScreen')?.classList.remove('hidden');
              document.getElementById('signupScreen')?.classList.add('hidden');
              document.getElementById('mainApp')?.classList.add('hidden');
              document.getElementById('loginButtons')?.classList.remove('hidden');
              document.getElementById('userButtons')?.classList.add('hidden');
          }

          function showMainApp() {
              document.getElementById('loginScreen')?.classList.add('hidden');
              document.getElementById('signupScreen')?.classList.add('hidden');
              document.getElementById('mainApp')?.classList.remove('hidden');
              document.getElementById('loginButtons')?.classList.add('hidden');
              document.getElementById('userButtons')?.classList.remove('hidden');
              if (document.getElementById('userName')) {
                  document.getElementById('userName').textContent = currentUser?.name || '';
              }
              showTab('reply');
          }
          
          function showSignupScreen() {
              document.getElementById('loginScreen')?.classList.add('hidden');
              document.getElementById('signupScreen')?.classList.remove('hidden');
              document.getElementById('mainApp')?.classList.add('hidden');
          }

          async function handleSignup(e) {
              e.preventDefault();
              const name = document.getElementById('signupName').value;
              const email = document.getElementById('signupEmail').value;
              const password = document.getElementById('signupPassword').value;
              const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

              if (password !== passwordConfirm) {
                  alert('パスワードが一致しません。');
                  return;
              }
              if (password.length < 6) {
                  alert('パスワードは6文字以上で入力してください。');
                  return;
              }

              try {
                  console.log('🔥 アカウント作成開始...');
                  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                  const user = userCredential.user;

                  // ディスプレイネーム設定
                  await updateProfile(user, {
                      displayName: name
                  });

                  // Firestoreにユーザー情報を保存
                  await setDoc(doc(db, "users", user.uid), {
                      name: name,
                      email: email,
                      createdAt: new Date().toISOString()
                  });
                  
                  console.log('✅ アカウント作成成功:', user.email);
                  alert('アカウント作成が完了しました！');
              } catch (error) {
                  console.error('❌ アカウント作成エラー:', error);
                  let errorMessage = 'アカウント作成に失敗しました。';
                  if (error.code === 'auth/email-already-in-use') {
                      errorMessage = 'このメールアドレスは既に使用されています。';
                  } else if (error.code === 'auth/weak-password') {
                      errorMessage = 'パスワードが弱すぎます。6文字以上で設定してください。';
                  } else if (error.code === 'auth/invalid-email') {
                      errorMessage = '有効なメールアドレスを入力してください。';
                  }
                  alert(errorMessage);
              }
          }

          async function loadUserKnowledge() {
              if (!currentUser) return;
              try {
                  const docRef = doc(db, "knowledge", currentUser.uid);
                  const docSnap = await getDoc(docRef);

                  if (docSnap.exists()) {
                      userKnowledge = docSnap.data();
                      populateKnowledgeForm();
                      console.log('✅ ナレッジ読み込み成功');
                  }
              } catch (error) {
                  console.error('❌ ナレッジ読み込みエラー:', error);
              }
          }
          
          function populateKnowledgeForm() {
              if (!userKnowledge) return;
              const fields = {
                  'businessType': userKnowledge.businessType || '',
                  'businessName': userKnowledge.businessName || '',
                  'websiteUrl': userKnowledge.websiteUrl || '',
                  'pricing': userKnowledge.services || userKnowledge.pricing || '',
                  'businessHours': userKnowledge.businessHours || '',
                  'reservationInfo': userKnowledge.reservationInfo || '',
                  'features': userKnowledge.features || ''
              };
              
              Object.entries(fields).forEach(([id, value]) => {
                  const element = document.getElementById(id);
                  if (element) element.value = value;
              });
          }

          async function saveKnowledge(e) {
              e.preventDefault();
              if (!currentUser) {
                  alert('ログインしていません。');
                  return;
              }

              const knowledgeData = {
                  businessType: document.getElementById('businessType')?.value || '',
                  businessName: document.getElementById('businessName')?.value || '',
                  websiteUrl: document.getElementById('websiteUrl')?.value || '',
                  services: document.getElementById('pricing')?.value || '',
                  businessHours: document.getElementById('businessHours')?.value || '',
                  reservationInfo: document.getElementById('reservationInfo')?.value || '',
                  features: document.getElementById('features')?.value || '',
                  updatedAt: new Date().toISOString()
              };

              try {
                  await setDoc(doc(db, "knowledge", currentUser.uid), knowledgeData);
                  userKnowledge = knowledgeData;
                  console.log('✅ ナレッジ保存成功');
                  alert('ナレッジを保存しました！');
                  showTab('reply');
              } catch (error) {
                  console.error('❌ ナレッジ保存エラー:', error);
                  alert('保存に失敗しました。\\n' + error.message);
              }
          }
          
          function showTab(tab) {
             document.querySelectorAll('[id$="Tab"]').forEach(btn => {
                 btn.classList.remove('border-primary-500', 'text-primary-600');
                 btn.classList.add('border-transparent', 'text-gray-500');
             });
             document.getElementById('replyPage')?.classList.add('hidden');
             document.getElementById('knowledgePage')?.classList.add('hidden');

             if (tab === 'reply') {
                 const replyTab = document.getElementById('replyTab');
                 if (replyTab) {
                     replyTab.classList.remove('border-transparent', 'text-gray-500');
                     replyTab.classList.add('border-primary-500', 'text-primary-600');
                 }
                 document.getElementById('replyPage')?.classList.remove('hidden');
             } else if (tab === 'knowledge') {
                 const knowledgeTab = document.getElementById('knowledgeTab');
                 if (knowledgeTab) {
                     knowledgeTab.classList.remove('border-transparent', 'text-gray-500');
                     knowledgeTab.classList.add('border-primary-500', 'text-primary-600');
                 }
                 document.getElementById('knowledgePage')?.classList.remove('hidden');
             }
          }
          
          function validateGenerateBtn() {
            const inquiryText = document.getElementById('inquiryText');
            const generateBtn = document.getElementById('generateBtn');
            if (inquiryText && generateBtn) {
              generateBtn.disabled = inquiryText.value.trim().length === 0;
            }
          }
          
          async function generateReplies() {
            alert('返信生成機能は現在開発中です。');
          }

          // 初期化
          document.addEventListener('DOMContentLoaded', init);
        </script>

        <style>
          .hidden { display: none; }
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
        
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e'
                  }
                }
              }
            }
          }
        </script>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- ナビゲーション -->
        <nav class="bg-white shadow-sm border-b">
            <div class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <h1 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-robot text-primary-500 mr-2"></i>
                            返信ボット
                        </h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="/" class="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center transition-colors">
                            <i class="fas fa-magic mr-2"></i>
                            AIコピー生成ink
                        </a>
                        <div id="navButtons" class="flex items-center space-x-4">
                            <!-- ログイン前 -->
                            <div id="loginButtons">
                                <button id="loginBtn" class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    <i class="fas fa-sign-in-alt mr-2"></i>
                                    ログイン
                                </button>
                            </div>
                            <!-- ログイン後 -->
                            <div id="userButtons" class="hidden">
                                <span id="userName" class="text-gray-600 mr-4"></span>
                                <button id="logoutBtn" class="text-gray-600 hover:text-gray-800 font-medium">
                                    <i class="fas fa-sign-out-alt mr-2"></i>
                                    ログアウト
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- ログイン画面 -->
        <div id="loginScreen" class="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div class="glass-effect rounded-2xl p-8 w-full max-w-md animate-fade-in">
                <div class="text-center mb-8">
                    <div class="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <i class="fas fa-robot text-2xl text-primary-500"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">返信ボット</h2>
                    <p class="text-gray-600">お客様対応を効率化</p>
                </div>

                <!-- ログインフォーム -->
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-envelope mr-2"></i>メールアドレス
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="your@email.com"
                            required
                        >
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-lock mr-2"></i>パスワード
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="パスワード"
                            required
                        >
                    </div>
                    
                    <button 
                        type="submit" 
                        class="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        ログイン
                    </button>
                </form>

                <div class="mt-8 text-center">
                    <p class="text-gray-600 text-sm mb-4">
                        アカウントをお持ちでない場合は、
                    </p>
                    <button id="signupBtn" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg">
                        <i class="fas fa-user-plus mr-2"></i>
                        新規登録はこちら
                    </button>
                </div>
            </div>
        </div>

        <!-- 新規登録画面 -->
        <div id="signupScreen" class="hidden min-h-screen gradient-bg flex items-center justify-center p-4">
            <div class="glass-effect rounded-2xl p-8 w-full max-w-2xl animate-fade-in">
                <div class="text-center mb-8">
                    <div class="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <i class="fas fa-user-plus text-2xl text-green-500"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">新規アカウント作成</h2>
                    <p class="text-gray-600">事業情報を登録して、精度の高い返信を実現しましょう</p>
                </div>

                <form id="signupForm" class="space-y-6">
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <h3 class="font-semibold text-blue-800 mb-2">
                            <i class="fas fa-user mr-2"></i>
                            ステップ1: アカウント情報
                        </h3>
                        <p class="text-sm text-blue-700">ログイン用の情報を入力してください</p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-user mr-2"></i>お名前
                            </label>
                            <input 
                                type="text" 
                                id="signupName" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="山田太郎"
                                required
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-envelope mr-2"></i>メールアドレス
                            </label>
                            <input 
                                type="email" 
                                id="signupEmail" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="your@email.com"
                                required
                            >
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-lock mr-2"></i>パスワード
                            </label>
                            <input 
                                type="password" 
                                id="signupPassword" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="8文字以上"
                                required
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-lock mr-2"></i>パスワード確認
                            </label>
                            <input 
                                type="password" 
                                id="signupPasswordConfirm" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="再入力してください"
                                required
                            >
                        </div>
                    </div>
                    
                    <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg">
                        <i class="fas fa-check mr-2"></i>
                        アカウント作成完了
                    </button>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-yellow-600 mt-1 mr-3"></i>
                            <div>
                                <h4 class="font-medium text-yellow-800 mb-1">事業情報について</h4>
                                <p class="text-sm text-yellow-700">
                                    アカウント作成後、「ナレッジ登録」タブで事業の詳細情報を入力していただくことで、より精度の高い返信生成が可能になります。
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
                
                <div class="mt-6 text-center">
                    <button id="backToLogin" class="text-primary-500 hover:text-primary-600 font-medium">
                        <i class="fas fa-arrow-left mr-2"></i>
                        ログイン画面に戻る
                    </button>
                </div>
            </div>
        </div>

        <!-- メインアプリ画面 -->
        <div id="mainApp" class="hidden min-h-screen">
            <!-- タブナビゲーション -->
            <div class="bg-white shadow-sm border-b">
                <div class="container mx-auto px-4">
                    <nav class="flex space-x-8">
                        <button id="replyTab" class="py-4 px-2 border-b-2 border-primary-500 text-primary-600 font-medium">
                            <i class="fas fa-reply mr-2"></i>返信生成
                        </button>
                        <button id="knowledgeTab" class="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                            <i class="fas fa-database mr-2"></i>ナレッジ登録
                        </button>
                    </nav>
                </div>
            </div>

            <!-- 返信生成ページ -->
            <div id="replyPage" class="container mx-auto px-4 py-8">
                <div class="max-w-4xl mx-auto">
                    <div class="glass-effect rounded-2xl p-8">
                        <div class="mb-8">
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                                <i class="fas fa-reply text-primary-500 mr-3"></i>
                                返信生成
                            </h2>
                            <p class="text-gray-600">お客様からの問い合わせに対する返信案を3パターン生成します</p>
                        </div>

                        <!-- 問い合わせ文入力 -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-3">
                                <i class="fas fa-comment-dots mr-2"></i>お客様からの問い合わせ文
                            </label>
                            <textarea 
                                id="inquiryText"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                rows="4"
                                placeholder="例：来週の土曜日に予約を取りたいのですが、空いている時間はありますか？料金も教えてください。"
                            ></textarea>
                        </div>

                        <!-- トーン選択 -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-3">
                                <i class="fas fa-palette mr-2"></i>返信トーン
                            </label>
                            <div class="grid grid-cols-3 gap-4">
                                <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name="tone" value="polite" class="mr-3" checked>
                                    <div>
                                        <div class="font-medium text-gray-800">丁寧</div>
                                        <div class="text-sm text-gray-600">敬語でしっかりと</div>
                                    </div>
                                </label>
                                <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name="tone" value="casual" class="mr-3">
                                    <div>
                                        <div class="font-medium text-gray-800">カジュアル</div>
                                        <div class="text-sm text-gray-600">親しみやすく</div>
                                    </div>
                                </label>
                                <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name="tone" value="firm" class="mr-3">
                                    <div>
                                        <div class="font-medium text-gray-800">きっぱり</div>
                                        <div class="text-sm text-gray-600">簡潔で明確に</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- 生成ボタン -->
                        <div class="mb-8 text-center">
                            <button 
                                id="generateBtn"
                                class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                disabled
                            >
                                <i class="fas fa-magic mr-2"></i>
                                返信案を生成
                            </button>
                        </div>

                        <!-- ナレッジ未登録警告 -->
                        <div id="noKnowledgeWarning" class="hidden p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div class="flex items-start">
                                <i class="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
                                <div>
                                    <h4 class="font-medium text-blue-800 mb-2">事業情報を登録してください</h4>
                                    <p class="text-sm text-blue-700 mb-3">返信生成には事業の基本情報（業種、サービス料金など）が必要です。</p>
                                    <button id="goToKnowledge" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                                        <i class="fas fa-database mr-2"></i>
                                        ナレッジ登録へ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ナレッジ登録ページ -->
            <div id="knowledgePage" class="hidden container mx-auto px-4 py-8">
                <div class="max-w-4xl mx-auto">
                    <div class="glass-effect rounded-2xl p-8">
                        <div class="mb-8">
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                                <i class="fas fa-database text-primary-500 mr-3"></i>
                                ナレッジ登録
                            </h2>
                            <p class="text-gray-600">事業の基本情報を登録して、正確な返信生成を可能にします</p>
                        </div>

                        <form id="knowledgeForm" class="space-y-8">
                            <!-- 基本情報 -->
                            <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                    <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                                    基本情報（必須）
                                </h3>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            <i class="fas fa-briefcase mr-2"></i>業種・業態
                                        </label>
                                        <select id="businessType" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                                            <option value="">選択してください</option>
                                            <option value="salon">美容サロン・エステ</option>
                                            <option value="ec">ネットショップ・EC</option>
                                            <option value="studio">写真館・スタジオ</option>
                                            <option value="restaurant">飲食店・カフェ</option>
                                            <option value="clinic">クリニック・治療院</option>
                                            <option value="school">教室・スクール</option>
                                            <option value="consulting">コンサルティング</option>
                                            <option value="other">その他</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            <i class="fas fa-building mr-2"></i>事業所・店舗名
                                        </label>
                                        <input 
                                            type="text" 
                                            id="businessName"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="例: 美容室ABC、山田写真館"
                                            required
                                        >
                                    </div>
                                </div>
                            </div>
                            
                            <!-- ウェブサイト情報 -->
                            <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                    <i class="fas fa-globe text-green-600 mr-2"></i>
                                    ウェブサイト情報（推奨）
                                </h3>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fas fa-link mr-2"></i>ホームページURL
                                    </label>
                                    <input 
                                        type="url" 
                                        id="websiteUrl"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="https://your-website.com"
                                    >
                                    <p class="text-xs text-gray-500 mt-2">
                                        <i class="fas fa-lightbulb text-yellow-500 mr-1"></i>
                                        ホームページがある場合は入力してください。サイトの情報を参考により精度の高い返信を生成できます。
                                    </p>
                                </div>
                            </div>

                            <!-- サービス・料金情報 -->
                            <div class="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                    <i class="fas fa-yen-sign text-yellow-600 mr-2"></i>
                                    サービス・料金情報（必須）
                                </h3>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fas fa-list mr-2"></i>主なサービス・料金
                                    </label>
                                    <textarea 
                                        id="pricing"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                        rows="3"
                                        placeholder="例：カット 3,000円〜、パーマ 8,000円〜、カラー 6,000円〜、フェイシャル 5,000円〜"
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            <!-- 詳細情報 -->
                            <div class="bg-purple-50 p-6 rounded-lg border border-purple-200">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                    <i class="fas fa-info-circle text-purple-600 mr-2"></i>
                                    詳細情報（推奨）
                                </h3>
                                
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            <i class="fas fa-clock mr-2"></i>営業時間・定休日
                                        </label>
                                        <textarea 
                                            id="businessHours"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                            rows="2"
                                            placeholder="例：平日 9:00-18:00、土日 10:00-17:00、定休日：月曜日"
                                        ></textarea>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            <i class="fas fa-calendar-check mr-2"></i>予約方法・アクセス
                                        </label>
                                        <textarea 
                                            id="reservationInfo"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                            rows="2"
                                            placeholder="例：電話予約のみ、オンライン予約可、駅から徒歩5分"
                                        ></textarea>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            <i class="fas fa-star mr-2"></i>特徴・セールスポイント
                                        </label>
                                        <textarea 
                                            id="features"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                            rows="3"
                                            placeholder="例：完全個室、オーガニック製品使用、駐車場完備、子連れ歓迎、初回割引あり"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- 保存ボタン -->
                            <div class="text-center pt-6">
                                <button 
                                    type="submit"
                                    class="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-12 py-4 rounded-lg transition-colors text-lg"
                                >
                                    <i class="fas fa-save mr-3"></i>
                                    ナレッジを保存する
                                </button>
                                <p class="text-sm text-gray-500 mt-3">
                                    <i class="fas fa-shield-alt text-green-500 mr-1"></i>
                                    入力された情報は安全に暗号化されて保存されます。
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- ローディング表示 -->
        <div id="loading" class="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p class="text-gray-600">処理中...</p>
            </div>
        </div>
    </body>
    </html>`)
})

export default app