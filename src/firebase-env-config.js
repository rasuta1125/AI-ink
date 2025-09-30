// 環境変数ベースのFirebase設定（推奨形式）
// Vite環境での使用例

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aiink-231e7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aiink-231e7",
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// フォールバック設定（開発用）
export const fallbackConfig = {
  apiKey: "AlzaSyAy-IH56f2DtXPp5wXIWGaY_vIiaoVVbyuM",
  authDomain: "aiink-231e7.firebaseapp.com", 
  projectId: "aiink-231e7",
  appId: "1:198276519701:web:c5e8f7a8b9d1e2f3g4h5i6j7"
};

// 設定値チェック
export const getFirebaseConfig = () => {
  // 環境変数が設定されているかチェック
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    console.log('🔥 Using environment variables for Firebase config');
    return firebaseConfig;
  } else {
    console.log('⚠️ Using fallback Firebase config (development)');
    return fallbackConfig;
  }
};