export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
}

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  userAgent?: string | null;
  ip?: string | null;
}

export interface RefreshTokenRepository {
  create(data: CreateRefreshTokenData): Promise<RefreshTokenRecord>;
  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  markRevoked(id: string, replacedByTokenId?: string | null): Promise<void>;
  revokeFamily(familyId: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');
