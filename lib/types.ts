import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    username: string;
  }
}

// Updated types to match your backend
export interface Category {
  _id: string;
  categoryName: string;
  urlKey: string;
  activeStatus: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  user: string;
  text: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  content: string;
  author: string;
  category: Category; // Always populated Category object from backend
  postDate: string;
  likeCount: number;
  commentCount: number;
  comments: Comment[];
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  source: string;
  message: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface BlogFormData {
  title: string;
  content: string;
  author: string;
  category: string;
  image?: string;
}
