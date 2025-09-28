import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { hookRoutes } from './routes/hooks'
import { ctaRoutes } from './routes/ctas'
import { hashtagRoutes } from './routes/hashtags'
import { captionRoutes } from './routes/captions'

const app = new Hono()

// CORS設定
app.use('/api/*', cors())

// レンダラー設定
app.use(renderer)

// API ルート
app.route('/api/hooks', hookRoutes)
app.route('/api/ctas', ctaRoutes)
app.route('/api/hashtags6', hashtagRoutes)
app.route('/api/captions', captionRoutes)

// メインページ
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>コピー生成AIインキャッチ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: {
                    50: '#f0f9ff',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8'
                  }
                }
              }
            }
          }
        </script>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- ヘッダー -->
            <header class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-magic text-primary-500 mr-3"></i>
                    コピー生成AI インキャッチ
                </h1>
                <p class="text-xl text-gray-600 mb-2">今日の投稿、ここからコピペで終わり。</p>
                <p class="text-sm text-gray-500">"今日出す1本"を最短で作る</p>
            </header>

            <!-- 入力フォーム -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">
                    <i class="fas fa-cog text-gray-600 mr-2"></i>
                    コンテンツ設定
                </h2>
                <form id="contentForm" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- 目標 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">目標</label>
                        <select id="goal" name="goal" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="認知">認知</option>
                            <option value="保存">保存</option>
                            <option value="CV">CV</option>
                        </select>
                    </div>

                    <!-- 業種 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">業種</label>
                        <select id="industry" name="industry" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="creator">クリエイター</option>
                            <option value="salon">個人サロン</option>
                            <option value="ec">個人EC</option>
                            <option value="local">地域発信</option>
                            <option value="other">その他</option>
                        </select>
                    </div>

                    <!-- トーン -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">トーン</label>
                        <select id="tone" name="tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="フレンドリー">フレンドリー</option>
                            <option value="専門家">専門家</option>
                            <option value="エモい">エモい</option>
                            <option value="きっぱり">きっぱり</option>
                        </select>
                    </div>

                    <!-- 導線 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">導線</label>
                        <select id="path" name="path" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="プロフィール">プロフィール</option>
                            <option value="リンク">リンク</option>
                            <option value="DM">DM</option>
                            <option value="フォーム">フォーム</option>
                        </select>
                    </div>

                    <!-- トピック -->
                    <div class="md:col-span-2 lg:col-span-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">トピック（100文字以内）</label>
                        <input type="text" id="topic" name="topic" maxlength="100" placeholder="例：空き枠案内、新サービス紹介、キャンペーン告知" 
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>

                    <!-- 期限 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">期限</label>
                        <select id="deadline" name="deadline" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="なし">なし</option>
                            <option value="今週中">今週中</option>
                            <option value="今月中">今月中</option>
                        </select>
                    </div>
                </form>
            </div>

            <!-- 3+1ボタン -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Hookメーカー -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="text-center mb-4">
                        <i class="fas fa-fish text-4xl text-orange-500 mb-2"></i>
                        <h3 class="text-xl font-semibold text-gray-800">Hook メーカー</h3>
                        <p class="text-sm text-gray-600">引きの1行 ×5案</p>
                    </div>
                    <button id="generateHooks" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                        生成する
                    </button>
                </div>

                <!-- CTAビルダー -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="text-center mb-4">
                        <i class="fas fa-bullhorn text-4xl text-green-500 mb-2"></i>
                        <h3 class="text-xl font-semibold text-gray-800">CTA ビルダー</h3>
                        <p class="text-sm text-gray-600">行動喚起 ×5案</p>
                    </div>
                    <button id="generateCTAs" class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                        生成する
                    </button>
                </div>

                <!-- #タグ6 -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="text-center mb-4">
                        <i class="fas fa-hashtag text-4xl text-purple-500 mb-2"></i>
                        <h3 class="text-xl font-semibold text-gray-800">#タグ6</h3>
                        <p class="text-sm text-gray-600">汎用・カテゴリ・ニッチ</p>
                    </div>
                    <button id="generateHashtags" class="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                        生成する
                    </button>
                </div>

                <!-- フル本文 -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="text-center mb-4">
                        <i class="fas fa-file-alt text-4xl text-blue-500 mb-2"></i>
                        <h3 class="text-xl font-semibold text-gray-800">フル本文</h3>
                        <p class="text-sm text-gray-600">完全版 ×3案</p>
                    </div>
                    <div class="mb-3">
                        <select id="length" class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                            <option value="short">短文 (120-180字)</option>
                            <option value="mid">中文 (200-350字)</option>
                            <option value="long">長文 (400-600字)</option>
                        </select>
                    </div>
                    <button id="generateCaptions" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                        生成する
                    </button>
                </div>
            </div>

            <!-- 結果表示エリア -->
            <div id="results" class="hidden">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-semibold text-gray-800">
                            <i class="fas fa-clipboard-list text-gray-600 mr-2"></i>
                            生成結果
                        </h2>
                        <button id="clearResults" class="text-red-500 hover:text-red-700 font-medium">
                            <i class="fas fa-times mr-1"></i>クリア
                        </button>
                    </div>
                    <div id="resultsContent"></div>
                </div>
            </div>

            <!-- ローディング -->
            <div id="loading" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
                    <div class="text-center">
                        <i class="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
                        <p class="text-lg font-medium text-gray-800">生成中...</p>
                        <p class="text-sm text-gray-600">しばらくお待ちください</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // グローバル状態
            let currentResults = {
                hooks: null,
                ctas: null,
                hashtags: null,
                captions: null
            };

            // DOM要素
            const loadingEl = document.getElementById('loading');
            const resultsEl = document.getElementById('results');
            const resultsContentEl = document.getElementById('resultsContent');
            
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
                        alert(\`\${field === 'topic' ? 'トピック' : field}を入力してください\`);
                        return false;
                    }
                }
                return true;
            }

            // ローディング表示/非表示
            function showLoading() {
                loadingEl.classList.remove('hidden');
            }

            function hideLoading() {
                loadingEl.classList.add('hidden');
            }

            // 結果表示
            function showResults() {
                resultsEl.classList.remove('hidden');
                resultsEl.scrollIntoView({ behavior: 'smooth' });
            }

            function renderResults() {
                let html = '';
                
                if (currentResults.hooks) {
                    html += renderHooks(currentResults.hooks);
                }
                if (currentResults.ctas) {
                    html += renderCTAs(currentResults.ctas);
                }
                if (currentResults.hashtags) {
                    html += renderHashtags(currentResults.hashtags);
                }
                if (currentResults.captions) {
                    html += renderCaptions(currentResults.captions);
                }
                
                resultsContentEl.innerHTML = html;
                showResults();
            }

            // Hook結果レンダリング
            function renderHooks(hooks) {
                return \`
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-orange-500 mb-3">
                            <i class="fas fa-fish mr-2"></i>Hook（引きの1行）
                        </h3>
                        <div class="space-y-2">
                            \${hooks.map((hook, index) => \`
                                <div class="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 cursor-pointer" 
                                     onclick="copyToClipboard('\${hook.replace(/'/g, "\\'")}', this)">
                                    <span class="text-sm text-orange-600 font-medium">\${index + 1}.</span>
                                    <span class="ml-2">\${hook}</span>
                                    <i class="fas fa-copy float-right text-orange-400"></i>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            // CTA結果レンダリング
            function renderCTAs(ctas) {
                return \`
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-green-500 mb-3">
                            <i class="fas fa-bullhorn mr-2"></i>CTA（行動喚起）
                        </h3>
                        <div class="space-y-2">
                            \${ctas.map((cta, index) => \`
                                <div class="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 cursor-pointer" 
                                     onclick="copyToClipboard('\${cta.replace(/'/g, "\\'")}', this)">
                                    <span class="text-sm text-green-600 font-medium">\${index + 1}.</span>
                                    <span class="ml-2">\${cta}</span>
                                    <i class="fas fa-copy float-right text-green-400"></i>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            // ハッシュタグ結果レンダリング
            function renderHashtags(hashtags) {
                return \`
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-purple-500 mb-3">
                            <i class="fas fa-hashtag mr-2"></i>ハッシュタグ（6個）
                        </h3>
                        <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 cursor-pointer" 
                             onclick="copyToClipboard('\${hashtags.join(' ').replace(/'/g, "\\'")}', this)">
                            <div class="flex flex-wrap gap-2">
                                \${hashtags.map(tag => \`<span class="bg-purple-200 text-purple-700 px-2 py-1 rounded text-sm">\${tag}</span>\`).join('')}
                            </div>
                            <i class="fas fa-copy float-right text-purple-400 mt-2"></i>
                        </div>
                    </div>
                \`;
            }

            // キャプション結果レンダリング
            function renderCaptions(captions) {
                return \`
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-blue-500 mb-3">
                            <i class="fas fa-file-alt mr-2"></i>フル本文（3案）
                        </h3>
                        <div class="space-y-4">
                            \${captions.map((caption, index) => \`
                                <div class="border border-blue-200 rounded-lg overflow-hidden">
                                    <div class="bg-blue-100 p-3 flex justify-between items-center">
                                        <span class="font-medium text-blue-700">案\${index + 1} (\${caption.text.length}字)</span>
                                        <button onclick="copyToClipboard('\${caption.text.replace(/'/g, "\\'")}', this)" 
                                                class="text-blue-500 hover:text-blue-700">
                                            <i class="fas fa-copy mr-1"></i>コピー
                                        </button>
                                    </div>
                                    <div class="p-4 bg-blue-50">
                                        <pre class="whitespace-pre-wrap text-sm leading-relaxed">\${caption.text}</pre>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            // クリップボードにコピー
            function copyToClipboard(text, element) {
                navigator.clipboard.writeText(text).then(() => {
                    const originalIcon = element.querySelector('.fa-copy');
                    if (originalIcon) {
                        originalIcon.className = 'fas fa-check float-right text-green-500';
                        setTimeout(() => {
                            originalIcon.className = originalIcon.className.replace('fa-check text-green-500', 'fa-copy text-orange-400');
                        }, 2000);
                    }
                }).catch(err => {
                    console.error('コピーに失敗しました:', err);
                    alert('コピーに失敗しました');
                });
            }

            // API呼び出し
            async function callAPI(endpoint, data) {
                try {
                    showLoading();
                    const response = await axios.post(\`/api/\${endpoint}\`, data);
                    return response.data;
                } catch (error) {
                    console.error(\`API Error (\${endpoint}):\`, error);
                    alert(\`エラーが発生しました: \${error.response?.data?.message || error.message}\`);
                    return null;
                } finally {
                    hideLoading();
                }
            }

            // イベントリスナー
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
                resultsEl.classList.add('hidden');
            });
        </script>
    </body>
    </html>
  `)
})

export default app