export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
