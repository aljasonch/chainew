export type UserRole = "admin" | "editor" | "author";
export type ArticleStatus = "draft" | "review" | "published";
export type ArticleOrigin = "neurafeed" | "manual";

export interface IUser {
    _id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISource {
    _id: string;
    name: string;
    url: string;
    createdAt: Date;
    updatedAt: Date;
    searchTokens?: string[];
}

export interface IArticleSource {
    name: string;
    url: string;
}

export interface IArticleSeo {
    metaTitle: string;
    metaDescription: string;
    ogImageUrl?: string;
    ogImagePublicId?: string;
}

export interface IArticle {
    _id: string;
    title: string;
    slug: string;
    subtitle?: string;
    summary: string;
    category: string;
    tags: string[];
    content_mdx: string;
    content_html: string;
    status: ArticleStatus;
    authorId: string | { _id?: string; name?: string; email?: string };
    author?: IUser;
    authorName?: string;
    authorEmail?: string;
    sources: IArticleSource[];
    seo: IArticleSeo;
    publishedAt?: Date;
    views?: number;
    weeklyViews?: number;
    source?: ArticleOrigin;
    neuraFeedId?: string;
    searchTokens?: string[];
    categoryKey?: string;
    tagsLower?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IRevision {
    _id: string;
    articleId: string | { _id?: string; title?: string; slug?: string };
    userId: string | { _id?: string; name?: string; email?: string };
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
    role: UserRole;
}

export interface AuthSessionUser {
    id: string;
    uid: string;
    email: string;
    name: string;
    role: UserRole;
}

export interface AuthSession {
    user: AuthSessionUser;
}
