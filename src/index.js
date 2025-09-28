import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS設定
app.use('/api/*', cors())

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
        <style>
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .feature-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .feature-card:hover {
            transform: translateY(-4px);
          }
          
          .result-item {
            transition: all 0.2s ease;
          }
          
          .result-item:hover {
            background-color: rgba(59, 130, 246, 0.05);
            border-color: rgba(59, 130, 246, 0.2);
          }
        </style>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <!-- ヘッダー -->
        <header class="relative overflow-hidden">
            <div class="absolute inset-0 gradient-bg opacity-90"></div>
            <div class="relative container mx-auto px-4 py-16 text-center text-white">
                <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    <i class="fas fa-magic mr-4 text-yellow-300"></i>
                    AIコピー生成ink
                </h1>
                <p class="text-2xl md:text-3xl font-semibold mb-8">
                    今日の投稿、ここからコピペで終わり。
                </p>
                <p class="text-xl md:text-2xl text-blue-100 mb-8">
                    Hook・CTA・ハッシュタグ。迷わない3ボタン。
                </p>
                <p class="text-lg text-blue-200">
                    考える前に出す。言葉のショートカット。
                </p>
            </div>
        </header>

        <!-- メインコンテンツ -->
        <main class="container mx-auto px-4 py-12">
            <!-- トピック入力 -->
            <div class="glass-effect rounded-2xl shadow-lg p-8 mb-12">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-lightbulb text-yellow-500 mr-3"></i>
                        投稿トピック
                    </h2>
                    <p class="text-gray-600">何について投稿したいですか？</p>
                </div>
                
                <div class="max-w-2xl mx-auto mb-8">
                    <input 
                        type="text" 
                        id="topic" 
                        class="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="例：新サービス開始のお知らせ、空き枠案内、キャンペーン告知"
                        maxlength="100"
                    >
                    <div class="text-right text-sm text-gray-500 mt-2">
                        <span id="topicCounter">0</span>/100文字
                    </div>
                </div>
            </div>

            <!-- 機能ボタンエリア -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <!-- Hook メーカー -->
                <div class="feature-card glass-effect rounded-2xl shadow-lg p-8 text-center">
                    <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-fish text-3xl text-orange-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">Hook メーカー</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        引きの1行を5パターン<br>
                        数字・質問・逆説・ギャップ・事実
                    </p>
                    <button id="generateHooks" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                        <i class="fas fa-magic mr-2"></i>Hook を生成
                    </button>
                </div>

                <!-- CTA ビルダー -->
                <div class="feature-card glass-effect rounded-2xl shadow-lg p-8 text-center">
                    <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-bullhorn text-3xl text-green-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">CTA ビルダー</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        行動喚起を5パターン<br>
                        動詞＋場所＋期限で構成
                    </p>
                    <button id="generateCTAs" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                        <i class="fas fa-bullhorn mr-2"></i>CTA を生成
                    </button>
                </div>

                <!-- #タグ6 -->
                <div class="feature-card glass-effect rounded-2xl shadow-lg p-8 text-center">
                    <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-hashtag text-3xl text-purple-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">#タグ6</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        最適なハッシュタグ6個<br>
                        汎用2・カテゴリ2・ニッチ2
                    </p>
                    <button id="generateHashtags" class="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                        <i class="fas fa-hashtag mr-2"></i>タグを生成
                    </button>
                </div>

                <!-- フル本文 -->
                <div class="feature-card glass-effect rounded-2xl shadow-lg p-8 text-center">
                    <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-file-alt text-3xl text-blue-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">フル本文</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        完全版を3パターン<br>
                        Hook→本文→CTA→ハッシュタグ
                    </p>
                    <div class="mb-4">
                        <select id="length" class="w-full p-2 text-sm border border-gray-200 rounded-lg">
                            <option value="short">短文 (120-180字)</option>
                            <option value="mid">中文 (200-350字)</option>
                            <option value="long">長文 (400-600字)</option>
                        </select>
                    </div>
                    <button id="generateCaptions" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                        <i class="fas fa-file-alt mr-2"></i>本文を生成
                    </button>
                </div>
            </div>

            <!-- 結果表示エリア -->
            <div id="results" class="hidden">
                <div class="glass-effect rounded-2xl shadow-lg p-8">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-clipboard-list mr-3"></i>
                            生成結果
                        </h2>
                        <button id="clearResults" class="text-red-500 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                            <i class="fas fa-times mr-2"></i>クリア
                        </button>
                    </div>
                    <div id="resultsContent"></div>
                </div>
            </div>
        </main>

        <!-- ローディング -->
        <div id="loading" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="glass-effect rounded-2xl p-8 text-center">
                <div class="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"></div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">生成中...</h3>
                <p class="text-gray-600">AIがコンテンツを作成しています</p>
            </div>
        </div>

        <!-- 成功通知 -->
        <div id="successToast" class="hidden fixed top-20 right-4 z-50">
            <div class="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
                <i class="fas fa-check-circle mr-3 text-xl"></i>
                <span>クリップボードにコピーしました！</span>
            </div>
        </div>

        <script>
            // グローバル状態
            let currentResults = {
                hooks: null,
                ctas: null,
                hashtags: null,
                captions: null
            };

            // DOM要素の取得
            const elements = {
                loading: document.getElementById('loading'),
                results: document.getElementById('results'),
                resultsContent: document.getElementById('resultsContent'),
                successToast: document.getElementById('successToast'),
                topicInput: document.getElementById('topic'),
                topicCounter: document.getElementById('topicCounter')
            };
            
            // 文字カウンター
            elements.topicInput.addEventListener('input', () => {
                const length = elements.topicInput.value.length;
                elements.topicCounter.textContent = length;
                elements.topicCounter.style.color = length > 90 ? '#ef4444' : length > 70 ? '#f59e0b' : '#6b7280';
            });

            // バリデーション
            function validateForm() {
                const topic = elements.topicInput.value.trim();
                if (!topic) {
                    alert('トピックを入力してください');
                    return false;
                }
                if (topic.length > 100) {
                    alert('トピックは100文字以内で入力してください');
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
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-fish text-orange-600 mr-2"></i>
                            Hook（引きの1行）
                        </h3>
                        <div class="grid gap-3">
                            \${hooks.map((hook, index) => \`
                                <div class="result-item p-4 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer hover:shadow-md" 
                                     onclick="copyToClipboard('\${hook.replace(/'/g, "\\\\'")}')">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-800">\${hook}</span>
                                        <i class="fas fa-copy text-orange-400 ml-3"></i>
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
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-bullhorn text-green-600 mr-2"></i>
                            CTA（行動喚起）
                        </h3>
                        <div class="grid gap-3">
                            \${ctas.map(cta => \`
                                <div class="result-item p-4 bg-green-50 border border-green-200 rounded-xl cursor-pointer hover:shadow-md" 
                                     onclick="copyToClipboard('\${cta.replace(/'/g, "\\\\'")}')">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-800">\${cta}</span>
                                        <i class="fas fa-copy text-green-400 ml-3"></i>
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
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-hashtag text-purple-600 mr-2"></i>
                            ハッシュタグ（6個セット）
                        </h3>
                        <div class="result-item p-6 bg-purple-50 border border-purple-200 rounded-xl cursor-pointer hover:shadow-md" 
                             onclick="copyToClipboard('\${hashtags.join(' ').replace(/'/g, "\\\\'")}')">
                            <div class="flex flex-wrap gap-3 mb-4">
                                \${hashtags.map(tag => \`
                                    <span class="bg-purple-200 text-purple-700 px-3 py-2 rounded-lg font-medium">\${tag}</span>
                                \`).join('')}
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
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-file-alt text-blue-600 mr-2"></i>
                            フル本文（3パターン）
                        </h3>
                        <div class="space-y-6">
                            \${captions.map((caption, index) => \`
                                <div class="border border-blue-200 rounded-xl overflow-hidden">
                                    <div class="bg-blue-100 p-4 flex justify-between items-center">
                                        <span class="font-semibold text-blue-800">パターン \${index + 1}</span>
                                        <button onclick="copyToClipboard('\${caption.text.replace(/'/g, "\\\\'")}'); event.stopPropagation();" 
                                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                            <i class="fas fa-copy mr-2"></i>コピー
                                        </button>
                                    </div>
                                    <div class="p-6 bg-blue-50">
                                        <pre class="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">\${caption.text}</pre>
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
                    alert('コピーに失敗しました');
                }
            }

            // フォールバックデータ生成
            function getFallbackData(type) {
                const topic = elements.topicInput.value.trim() || 'サンプル';
                
                switch(type) {
                    case 'hooks':
                        return [
                            \`3つの理由で\${topic}が注目されています\`,
                            \`\${topic}について知っていますか？\`,
                            \`実は\${topic}の常識は間違いだった？\`,
                            \`まさかの\${topic}の真実とは\`,
                            \`今日の\${topic}レポート\`
                        ];
                    case 'ctas':
                        return [
                            \`詳細はプロフィールをチェック！\`,
                            \`DMで気軽にお問い合わせください\`,
                            \`今すぐリンクから予約を！\`,
                            \`コメントでご質問をどうぞ\`,
                            \`フォームから申し込み受付中\`
                        ];
                    case 'hashtags':
                        return ['#今日', '#おすすめ', '#新着', '#限定', '#人気', '#注目'];
                    case 'captions':
                        return [
                            {
                                text: \`【\${topic}のお知らせ】\\n\\n皆様お疲れ様です！\\n\\n\${topic}についてご案内です。詳細はプロフィールのリンクからご確認いただけます。\\n\\nご質問等ございましたら、お気軽にDMでお聞かせください。\\n\\n#今日 #おすすめ #新着 #限定 #人気 #注目\`
                            },
                            {
                                text: \`✨\${topic}について✨\\n\\nこんにちは！今日は\${topic}についてお話しします。\\n\\n多くの方からお問い合わせをいただいているこちらの件について、詳しくお伝えしたいと思います。\\n\\n詳しくはプロフィールをチェック👆\\n\\n#今日 #おすすめ #新着 #限定 #人気 #注目\`
                            },
                            {
                                text: \`\${topic}に関する重要なお知らせです。\\n\\n日頃より当サービスをご利用いただき、誠にありがとうございます。\\n\\n\${topic}につきまして、多くのお客様からご要望をいただいておりました件について、この度正式にご案内できることとなりました。\\n\\n詳細な内容につきましては、プロフィール欄のリンクより専用ページをご覧ください。\\n\\n#今日 #おすすめ #新着 #限定 #人気 #注目\`
                            }
                        ];
                }
            }

            // 生成機能
            async function generateContent(type) {
                if (!validateForm()) return;
                
                showLoading();
                
                // 簡易デモ用の待機時間
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                currentResults[type] = getFallbackData(type);
                renderResults();
                
                hideLoading();
            }

            // イベントリスナー設定
            document.getElementById('generateHooks').addEventListener('click', () => generateContent('hooks'));
            document.getElementById('generateCTAs').addEventListener('click', () => generateContent('ctas'));
            document.getElementById('generateHashtags').addEventListener('click', () => generateContent('hashtags'));
            document.getElementById('generateCaptions').addEventListener('click', () => generateContent('captions'));

            document.getElementById('clearResults').addEventListener('click', () => {
                currentResults = { hooks: null, ctas: null, hashtags: null, captions: null };
                elements.results.classList.add('hidden');
            });
        </script>
    </body>
    </html>`)
})

export default app