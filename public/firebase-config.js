// Firebase設定とSDK初期化
// Firebase v9+ Modular SDK

// Firebase SDKのインポート（CDN版では自動的に利用可能）
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// Firebase設定オブジェクト
// 注意: 実際のプロジェクトでは環境変数を使用してください
const firebaseConfig = {
  // TODO: Firebase コンソールからプロジェクト設定を取得して入力
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  // Firestoreを使用する場合
  databaseURL: "https://your-project.firebaseio.com"
};

// Firebase初期化
let app, auth, db;

// Firebase SDKが読み込まれているかチェック
if (typeof firebase !== 'undefined') {
  // Firebase v8 互換性SDKの場合
  if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
  } else {
    app = firebase.app();
  }
  
  auth = firebase.auth();
  db = firebase.firestore();
  
  console.log('🔥 Firebase initialized successfully (v8 SDK)');
} else {
  console.error('❌ Firebase SDK not loaded. Please include Firebase scripts in HTML.');
}

// Firebase認証状態の変更を監視
if (auth) {
  auth.onAuthStateChanged((user) => {
    console.log('🔐 Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
    
    // グローバルに認証状態を通知
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user } 
    }));
  });
}

// エクスポート（グローバル変数として設定）
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;

// ヘルパー関数
window.Firebase = {
  // 認証関連
  async signUp(email, password, displayName) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // ディスプレイネーム設定
      if (displayName) {
        await user.updateProfile({
          displayName: displayName
        });
      }
      
      console.log('✅ User created successfully:', user.email);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Signup error:', error);
      return { success: false, error: error.message };
    }
  },

  async signIn(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      console.log('✅ User signed in successfully:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Signin error:', error);
      return { success: false, error: error.message };
    }
  },

  async signOut() {
    try {
      await auth.signOut();
      console.log('✅ User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Signout error:', error);
      return { success: false, error: error.message };
    }
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  // Firestore関連
  async saveUserKnowledge(userId, knowledgeData) {
    try {
      await db.collection('userKnowledge').doc(userId).set({
        ...knowledgeData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        userId: userId
      }, { merge: true });
      
      console.log('✅ Knowledge saved successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Save knowledge error:', error);
      return { success: false, error: error.message };
    }
  },

  async getUserKnowledge(userId) {
    try {
      const doc = await db.collection('userKnowledge').doc(userId).get();
      if (doc.exists) {
        console.log('✅ Knowledge loaded successfully');
        return { success: true, data: doc.data() };
      } else {
        console.log('ℹ️ No knowledge found for user');
        return { success: true, data: null };
      }
    } catch (error) {
      console.error('❌ Load knowledge error:', error);
      return { success: false, error: error.message };
    }
  },

  // エラーメッセージの日本語化
  translateAuthError(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'アカウントが見つかりません。',
      'auth/wrong-password': 'パスワードが間違っています。',
      'auth/email-already-in-use': 'このメールアドレスは既に使用されています。',
      'auth/weak-password': 'パスワードは6文字以上で入力してください。',
      'auth/invalid-email': '有効なメールアドレスを入力してください。',
      'auth/too-many-requests': 'ログイン試行回数が上限に達しました。しばらく時間をおいてから再度お試しください。',
      'auth/network-request-failed': 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
    };
    
    return errorMessages[errorCode] || 'エラーが発生しました。';
  }
};