import { SignJWT, jwtVerify } from 'jose'

console.log("JWT_SECRET =", process.env.JWT_SECRET);

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production"
);

export interface JWTPayload {
  sub: string       // user id
  email: string
  role: 'admin' | 'akuntan' | 'owner'
  company_id: string
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as JWTPayload
}
