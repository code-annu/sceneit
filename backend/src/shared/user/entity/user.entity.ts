export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly isEmailVerified: boolean;
  readonly isBanned: boolean;
  readonly isDeleted: boolean;
  readonly deletedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserCreate {
  username: string;
  email: string;
  passwordHash: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  passwordHash?: string;
  isEmailVerified?: boolean;
  isBanned?: boolean;
}