import { Types } from "mongoose";

export interface IUser {
    _id: Types.ObjectId;
    email: string;
    passwordHash: string;
    name: string;
    role: "admin" | "editor" | "author";
    createdAt: Date;
    updatedAt: Date;
}

export interface ISource {
    _id: Types.ObjectId;
    name: string;
    url: string;
    createdAt: Date;
}

export interface IArticleSource {
    name: string;
    url: string;
}

export interface IArticleSeo {
    metaTitle: string;
    metaDescription: string;
    ogImageUrl?: string;
}

export interface IArticle {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    subtitle?: string;
    summary: string;
    category: string;
    tags: string[];
    content_mdx: string;
    content_html: string;
    status: "draft" | "review" | "published";
    authorId: Types.ObjectId;
    author?: IUser;
    sources: IArticleSource[];
    seo: IArticleSeo;
    publishedAt?: Date;
    views?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRevision {
    _id: Types.ObjectId;
    articleId: Types.ObjectId;
    userId: Types.ObjectId;
    user?: IUser;
    changes: Record<string, { old: unknown; new: unknown }>;
    createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Form Types
export interface ArticleFormData {
    title: string;
    subtitle?: string;
    slug: string;
    summary: string;
    category: string;
    tags: string[];
    content_mdx: string;
    status: "draft" | "review" | "published";
    sources: IArticleSource[];
    seo: IArticleSeo;
}

export interface UserFormData {
    email: string;
    name: string;
    password?: string;
    role: "admin" | "editor" | "author";
}

// Session Types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: "admin" | "editor" | "author";
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        role: "admin" | "editor" | "author";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "admin" | "editor" | "author";
    }
}
