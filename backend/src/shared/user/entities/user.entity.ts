export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate {
  email: string;
  username: string;
  passwordHash: string;
  isEmailVerified?: boolean;
}

export interface UserUpdate {
  username: string;
  passwordHash: string;
  isEmailVerified: boolean;
  isBanned: boolean;
}
