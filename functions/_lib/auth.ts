// Firebase IDトークン検証ライブラリ
import { createRemoteJWKSet, jwtVerify } from "jose";

// Firebase公開鍵のJWKS エンドポイント
const JWKS = createRemoteJWKSet(new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
));

export interface FirebaseUser {
  sub: string; // ユーザーID
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

/**
 * Firebase IDトークンを検証してユーザー情報を返す
 * @param token IDトークン
 * @param projectId Firebase プロジェクトID
 * @returns ユーザー情報
 */
export async function verifyFirebaseIdToken(token: string, projectId: string): Promise<FirebaseUser> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    
    return payload as FirebaseUser;
  } catch (error) {
    console.error('Firebase IDトークン検証エラー:', error);
    throw new Error('Invalid Firebase ID token');
  }
}

/**
 * リクエストからAuthorizationヘッダーを取得してトークンを抽出
 * @param request Request オブジェクト
 * @returns トークン文字列 (Bearer プレフィックスなし)
 */
export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  return authHeader.slice(7); // "Bearer " を削除
}

/**
 * リクエストを認証してユーザー情報を取得
 * @param request Request オブジェクト
 * @param projectId Firebase プロジェクトID
 * @returns ユーザー情報
 */
export async function authenticateRequest(request: Request, projectId: string): Promise<FirebaseUser> {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    throw new Error('No authorization token provided');
  }
  
  return await verifyFirebaseIdToken(token, projectId);
}