import "server-only";

import crypto from "node:crypto";

import {
    DocumentData,
    FieldValue,
    FirestoreDataConverter,
    Query,
    QueryDocumentSnapshot,
    Timestamp,
    Transaction,
} from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebaseAdmin";
import {
    ArticleOrigin,
    ArticleStatus,
    IArticle,
    IArticleSeo,
    IArticleSource,
    IRevision,
    ISource,
    IUser,
    UserRole,
} from "@/types";

interface UniqueDoc {
    ownerId: string;
    createdAt: Date;
}

interface UserDoc {
    email: string;
    emailLower: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
}

interface SourceDoc {
    name: string;
    url: string;
    searchTokens: string[];
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
}

interface ArticleDoc {
    title: string;
    slug: string;
    slugLower: string;
    subtitle: string;
    summary: string;
    category: string;
    categoryKey: string;
    tags: string[];
    tagsLower: string[];
    content_mdx: string;
    content_html: string;
    status: ArticleStatus;
    authorId: string;
    authorName: string;
    authorEmail: string;
    sources: IArticleSource[];
    seo: IArticleSeo;
    publishedAt?: Date | Timestamp;
    views: number;
    source: ArticleOrigin;
    neuraFeedId?: string;
    searchTokens: string[];
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
}

interface RevisionDoc {
    articleId: string;
    userId: string;
    changes: Record<string, { old: unknown; new: unknown }>;
    createdAt: Date | Timestamp;
}

interface ViewDoc {
    articleId: string;
    ipHash: string;
    dayKey: string;
    createdAt: Date | Timestamp;
    expireAt: Date | Timestamp;
}

interface LegacyAuthor {
    _id: string;
    name?: string;
    email?: string;
}

const makeConverter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
    toFirestore(value: T): DocumentData {
        return value;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
        return snapshot.data() as T;
    },
});

export const usersCollection = adminDb
    .collection("users")
    .withConverter<UserDoc>(makeConverter<UserDoc>());

export const sourcesCollection = adminDb
    .collection("sources")
    .withConverter<SourceDoc>(makeConverter<SourceDoc>());

export const articlesCollection = adminDb
    .collection("articles")
    .withConverter<ArticleDoc>(makeConverter<ArticleDoc>());

export const revisionsCollection = adminDb
    .collection("revisions")
    .withConverter<RevisionDoc>(makeConverter<RevisionDoc>());

export const viewsCollection = adminDb
    .collection("views")
    .withConverter<ViewDoc>(makeConverter<ViewDoc>());

const uniqueSlugsCollection = adminDb
    .collection("uniqueArticleSlugs")
    .withConverter<UniqueDoc>(makeConverter<UniqueDoc>());

const uniqueEmailsCollection = adminDb
    .collection("uniqueUserEmails")
    .withConverter<UniqueDoc>(makeConverter<UniqueDoc>());

const uniqueNeuraFeedIdsCollection = adminDb
    .collection("uniqueNeuraFeedIds")
    .withConverter<UniqueDoc>(makeConverter<UniqueDoc>());

const DAY_MS = 24 * 60 * 60 * 1000;
const TRENDING_LOOKBACK_DAYS = 7;
const VIEW_LOG_RETENTION_DAYS = TRENDING_LOOKBACK_DAYS + 1;

function makeError(message: string, code: string): Error & { code: string } {
    const error = new Error(message) as Error & { code: string };
    error.code = code;
    return error;
}

function toDate(value: Date | Timestamp | undefined): Date {
    if (!value) {
        return new Date(0);
    }
    if (value instanceof Timestamp) {
        return value.toDate();
    }
    return value;
}

function cleanText(value: string): string {
    return value.trim().replace(/\s+/g, " ");
}

function normalizeEmail(value: string): string {
    return cleanText(value).toLowerCase();
}

function normalizeSlug(value: string): string {
    return cleanText(value).toLowerCase();
}

export function normalizeCategoryKey(value: string): string {
    return cleanText(value)
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function normalizeTag(value: string): string {
    return cleanText(value).toLowerCase();
}

export function buildSearchTokens(...values: string[]): string[] {
    const tokens = new Set<string>();

    for (const value of values) {
        if (!value) {
            continue;
        }

        const normalized = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();

        if (!normalized) {
            continue;
        }

        for (const part of normalized.split(/\s+/)) {
            if (part.length < 2) {
                continue;
            }
            tokens.add(part);
        }
    }

    return Array.from(tokens).slice(0, 100);
}

function chunk<T>(items: T[], size: number): T[] {
    if (items.length <= size) {
        return items;
    }

    return items.slice(0, size);
}

function mapUser(id: string, data: UserDoc): IUser {
    return {
        _id: id,
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
    };
}

function mapSource(id: string, data: SourceDoc): ISource {
    return {
        _id: id,
        name: data.name,
        url: data.url,
        searchTokens: data.searchTokens ?? [],
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
    };
}

function toLegacyAuthor(data: ArticleDoc): LegacyAuthor {
    return {
        _id: data.authorId,
        name: data.authorName,
        email: data.authorEmail,
    };
}

function mapArticle(id: string, data: ArticleDoc): IArticle {
    return {
        _id: id,
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        summary: data.summary,
        category: data.category,
        tags: data.tags ?? [],
        content_mdx: data.content_mdx,
        content_html: data.content_html,
        status: data.status,
        authorId: toLegacyAuthor(data),
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        sources: data.sources ?? [],
        seo: data.seo,
        publishedAt: data.publishedAt ? toDate(data.publishedAt) : undefined,
        views: data.views ?? 0,
        source: data.source,
        neuraFeedId: data.neuraFeedId,
        searchTokens: data.searchTokens ?? [],
        categoryKey: data.categoryKey,
        tagsLower: data.tagsLower ?? [],
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
    };
}

function mapRevision(id: string, data: RevisionDoc): IRevision {
    return {
        _id: id,
        articleId: data.articleId,
        userId: data.userId,
        changes: data.changes,
        createdAt: toDate(data.createdAt),
    };
}

function baseArticleQuery(filters: {
    status?: string | null;
    category?: string | null;
    source?: string | null;
}): Query<ArticleDoc> {
    let query: Query<ArticleDoc> = articlesCollection;

    if (filters.status) {
        query = query.where("status", "==", filters.status as ArticleStatus);
    }

    if (filters.category) {
        query = query.where("categoryKey", "==", normalizeCategoryKey(filters.category));
    }

    if (filters.source) {
        query = query.where("source", "==", filters.source as ArticleOrigin);
    }

    return query;
}

function parsePublishedAt(value: unknown): Date | undefined {
    if (!value) {
        return undefined;
    }

    if (value instanceof Date) {
        return value;
    }

    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            return date;
        }
    }

    return undefined;
}

function normalizeSources(value: unknown): IArticleSource[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== "object") {
                return null;
            }

            const source = item as { name?: unknown; url?: unknown };
            if (typeof source.name !== "string" || typeof source.url !== "string") {
                return null;
            }

            const name = cleanText(source.name);
            const url = cleanText(source.url);
            if (!name || !url) {
                return null;
            }

            return { name, url };
        })
        .filter(Boolean) as IArticleSource[];
}

function normalizeSeo(value: unknown): IArticleSeo {
    const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

    return {
        metaTitle:
            typeof data.metaTitle === "string" ? cleanText(data.metaTitle) : "",
        metaDescription:
            typeof data.metaDescription === "string"
                ? cleanText(data.metaDescription)
                : "",
        ogImageUrl:
            typeof data.ogImageUrl === "string" && data.ogImageUrl.trim()
                ? cleanText(data.ogImageUrl)
                : "",
        ogImagePublicId:
            typeof data.ogImagePublicId === "string" && data.ogImagePublicId.trim()
                ? cleanText(data.ogImagePublicId)
                : "",
    };
}

function normalizeTags(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => cleanText(tag))
        .filter(Boolean);
}

function normalizeArticleStatus(value: unknown): ArticleStatus {
    if (value === "review" || value === "published") {
        return value;
    }
    return "draft";
}

function normalizeArticleSource(value: unknown): ArticleOrigin {
    if (value === "neurafeed") {
        return "neurafeed";
    }
    return "manual";
}

export interface CreateArticleInput {
    title: string;
    slug: string;
    subtitle?: string;
    summary: string;
    category: string;
    tags?: string[];
    content_mdx?: string;
    content_html?: string;
    status?: ArticleStatus;
    authorId: string;
    authorName: string;
    authorEmail: string;
    sources?: IArticleSource[];
    seo?: IArticleSeo;
    publishedAt?: Date | string;
    views?: number;
    source?: ArticleOrigin;
    neuraFeedId?: string;
}

function buildArticleDoc(input: CreateArticleInput, now: Date): ArticleDoc {
    const title = cleanText(input.title);
    const summary = cleanText(input.summary);
    const subtitle = cleanText(input.subtitle ?? "");
    const category = cleanText(input.category);
    const tags = normalizeTags(input.tags ?? []);
    const seo = normalizeSeo(input.seo ?? {});

    const status = normalizeArticleStatus(input.status);
    const publishedAt =
        status === "published"
            ? parsePublishedAt(input.publishedAt) ?? now
            : parsePublishedAt(input.publishedAt);

    return {
        title,
        slug: normalizeSlug(input.slug),
        slugLower: normalizeSlug(input.slug),
        subtitle,
        summary,
        category,
        categoryKey: normalizeCategoryKey(category),
        tags,
        tagsLower: tags.map(normalizeTag),
        content_mdx: input.content_mdx ?? "",
        content_html: input.content_html ?? "",
        status,
        authorId: input.authorId,
        authorName: input.authorName,
        authorEmail: normalizeEmail(input.authorEmail),
        sources: normalizeSources(input.sources ?? []),
        seo,
        publishedAt,
        views: Number(input.views ?? 0),
        source: normalizeArticleSource(input.source),
        ...(input.neuraFeedId ? { neuraFeedId: cleanText(input.neuraFeedId) } : {}),
        searchTokens: buildSearchTokens(title, subtitle, summary, category, ...tags),
        createdAt: now,
        updatedAt: now,
    };
}

function assertUniqueOwner<T extends { ownerId: string }>(
    data: T | undefined,
    ownerId: string,
    message: string
) {
    if (!data || data.ownerId !== ownerId) {
        throw makeError(message, "not-found");
    }
}

async function assertSlugAvailable(
    tx: Transaction,
    slugLower: string,
    ownerId: string,
    allowExistingOwner: boolean
): Promise<void> {
    const ref = uniqueSlugsCollection.doc(slugLower);
    const snapshot = await tx.get(ref);

    if (!snapshot.exists) {
        return;
    }

    if (allowExistingOwner && snapshot.data()?.ownerId === ownerId) {
        return;
    }

    throw makeError("Article slug already exists", "already-exists");
}

async function assertNeuraFeedIdAvailable(
    tx: Transaction,
    neuraFeedId: string,
    ownerId: string,
    allowExistingOwner: boolean
): Promise<void> {
    const ref = uniqueNeuraFeedIdsCollection.doc(neuraFeedId);
    const snapshot = await tx.get(ref);

    if (!snapshot.exists) {
        return;
    }

    if (allowExistingOwner && snapshot.data()?.ownerId === ownerId) {
        return;
    }

    throw makeError("NeuraFeed article already exists", "already-exists");
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
    const emailLower = normalizeEmail(email);
    const snapshot = await usersCollection.where("emailLower", "==", emailLower).limit(1).get();

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return mapUser(doc.id, doc.data());
}

export async function getUserById(id: string): Promise<IUser | null> {
    const snapshot = await usersCollection.doc(id).get();
    if (!snapshot.exists) {
        return null;
    }
    return mapUser(snapshot.id, snapshot.data() as UserDoc);
}

export async function listUsers(page: number, limit: number): Promise<{ items: IUser[]; total: number }> {
    const offset = (page - 1) * limit;

    const base = usersCollection.orderBy("createdAt", "desc");
    const [countSnap, itemsSnap] = await Promise.all([
        base.count().get(),
        base.offset(offset).limit(limit).get(),
    ]);

    return {
        total: countSnap.data().count,
        items: itemsSnap.docs.map((doc) => mapUser(doc.id, doc.data())),
    };
}

export async function createUser(input: {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
}): Promise<IUser> {
    const now = new Date();
    const userRef = usersCollection.doc();
    const emailLower = normalizeEmail(input.email);

    await adminDb.runTransaction(async (tx) => {
        const uniqueRef = uniqueEmailsCollection.doc(emailLower);
        const uniqueSnap = await tx.get(uniqueRef);

        if (uniqueSnap.exists) {
            throw makeError("User already exists", "already-exists");
        }

        const doc: UserDoc = {
            email: cleanText(input.email),
            emailLower,
            passwordHash: input.passwordHash,
            name: cleanText(input.name),
            role: input.role,
            createdAt: now,
            updatedAt: now,
        };

        tx.set(userRef, doc);
        tx.set(uniqueRef, { ownerId: userRef.id, createdAt: now });
    });

    const user = await getUserById(userRef.id);
    if (!user) {
        throw makeError("Failed to create user", "internal");
    }
    return user;
}

export async function updateUser(
    id: string,
    updates: Partial<{ email: string; passwordHash: string; name: string; role: UserRole }>
): Promise<IUser | null> {
    const userRef = usersCollection.doc(id);

    await adminDb.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);

        if (!userSnap.exists) {
            throw makeError("User not found", "not-found");
        }

        const existing = userSnap.data() as UserDoc;
        const now = new Date();

        const nextEmail =
            typeof updates.email === "string" && updates.email.trim()
                ? cleanText(updates.email)
                : existing.email;

        const nextEmailLower = normalizeEmail(nextEmail);
        if (nextEmailLower !== existing.emailLower) {
            const nextUniqueRef = uniqueEmailsCollection.doc(nextEmailLower);
            const nextUniqueSnap = await tx.get(nextUniqueRef);
            if (nextUniqueSnap.exists) {
                throw makeError("User already exists", "already-exists");
            }
            tx.delete(uniqueEmailsCollection.doc(existing.emailLower));
            tx.set(nextUniqueRef, { ownerId: id, createdAt: now });
        }

        const nextDoc: UserDoc = {
            email: nextEmail,
            emailLower: nextEmailLower,
            passwordHash:
                typeof updates.passwordHash === "string" && updates.passwordHash
                    ? updates.passwordHash
                    : existing.passwordHash,
            name:
                typeof updates.name === "string" && updates.name.trim()
                    ? cleanText(updates.name)
                    : existing.name,
            role: updates.role ?? existing.role,
            createdAt: existing.createdAt,
            updatedAt: now,
        };

        tx.set(userRef, nextDoc);
    });

    return getUserById(id);
}

export async function deleteUser(id: string): Promise<boolean> {
    const userRef = usersCollection.doc(id);

    await adminDb.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);

        if (!userSnap.exists) {
            throw makeError("User not found", "not-found");
        }

        const user = userSnap.data() as UserDoc;
        tx.delete(userRef);
        tx.delete(uniqueEmailsCollection.doc(user.emailLower));
    });

    return true;
}

export async function getOrCreateNeuraFeedUser(): Promise<IUser> {
    const existing = await getUserByEmail("neurafeed@chainew.bot");
    if (existing) {
        return existing;
    }

    return createUser({
        email: "neurafeed@chainew.bot",
        passwordHash: "!",
        name: "NeuraFeed",
        role: "author",
    });
}

export async function listSources(page: number, limit: number, search?: string | null): Promise<{ items: ISource[]; total: number }> {
    const normalizedSearch = search?.trim() ?? "";

    if (!normalizedSearch) {
        const offset = (page - 1) * limit;
        const base = sourcesCollection.orderBy("name", "asc");
        const [countSnap, itemsSnap] = await Promise.all([
            base.count().get(),
            base.offset(offset).limit(limit).get(),
        ]);

        return {
            total: countSnap.data().count,
            items: itemsSnap.docs.map((doc) => mapSource(doc.id, doc.data())),
        };
    }

    const tokens = chunk(buildSearchTokens(normalizedSearch), 10);
    if (tokens.length === 0) {
        return { items: [], total: 0 };
    }

    const snapshot = await sourcesCollection
        .where("searchTokens", "array-contains-any", tokens)
        .limit(250)
        .get();

    const all = snapshot.docs
        .map((doc) => mapSource(doc.id, doc.data()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const offset = (page - 1) * limit;
    return {
        total: all.length,
        items: all.slice(offset, offset + limit),
    };
}

export async function createSource(input: { name: string; url: string }): Promise<ISource> {
    const now = new Date();
    const sourceRef = sourcesCollection.doc();

    const sourceDoc: SourceDoc = {
        name: cleanText(input.name),
        url: cleanText(input.url),
        searchTokens: buildSearchTokens(input.name, input.url),
        createdAt: now,
        updatedAt: now,
    };

    await sourceRef.set(sourceDoc);
    const sourceSnap = await sourceRef.get();
    return mapSource(sourceSnap.id, sourceSnap.data() as SourceDoc);
}

export async function updateSource(id: string, updates: Partial<{ name: string; url: string }>): Promise<ISource | null> {
    const sourceRef = sourcesCollection.doc(id);
    const sourceSnap = await sourceRef.get();

    if (!sourceSnap.exists) {
        return null;
    }

    const existing = sourceSnap.data() as SourceDoc;
    const name =
        typeof updates.name === "string" && updates.name.trim()
            ? cleanText(updates.name)
            : existing.name;
    const url =
        typeof updates.url === "string" && updates.url.trim()
            ? cleanText(updates.url)
            : existing.url;

    const nextDoc: SourceDoc = {
        ...existing,
        name,
        url,
        searchTokens: buildSearchTokens(name, url),
        updatedAt: new Date(),
    };

    await sourceRef.set(nextDoc);
    return mapSource(id, nextDoc);
}

export async function deleteSource(id: string): Promise<boolean> {
    const sourceRef = sourcesCollection.doc(id);
    const sourceSnap = await sourceRef.get();

    if (!sourceSnap.exists) {
        return false;
    }

    await sourceRef.delete();
    return true;
}

export async function createArticle(input: CreateArticleInput): Promise<IArticle> {
    const now = new Date();
    const articleRef = articlesCollection.doc();
    const doc = buildArticleDoc(input, now);

    await adminDb.runTransaction(async (tx) => {
        await assertSlugAvailable(tx, doc.slugLower, articleRef.id, false);

        if (doc.neuraFeedId) {
            await assertNeuraFeedIdAvailable(tx, doc.neuraFeedId, articleRef.id, false);
        }

        tx.set(articleRef, doc);
        tx.set(uniqueSlugsCollection.doc(doc.slugLower), {
            ownerId: articleRef.id,
            createdAt: now,
        });

        if (doc.neuraFeedId) {
            tx.set(uniqueNeuraFeedIdsCollection.doc(doc.neuraFeedId), {
                ownerId: articleRef.id,
                createdAt: now,
            });
        }
    });

    return mapArticle(articleRef.id, doc);
}

export async function getArticleById(id: string): Promise<IArticle | null> {
    const snapshot = await articlesCollection.doc(id).get();
    if (!snapshot.exists) {
        return null;
    }

    return mapArticle(snapshot.id, snapshot.data() as ArticleDoc);
}

export async function getArticleBySlug(slug: string, status?: ArticleStatus): Promise<IArticle | null> {
    let query: Query<ArticleDoc> = articlesCollection.where("slugLower", "==", normalizeSlug(slug));

    if (status) {
        query = query.where("status", "==", status);
    }

    const snapshot = await query.limit(1).get();
    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return mapArticle(doc.id, doc.data());
}

export async function findArticleByNeuraFeedId(neuraFeedId: string): Promise<IArticle | null> {
    const snapshot = await articlesCollection
        .where("neuraFeedId", "==", cleanText(neuraFeedId))
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return mapArticle(doc.id, doc.data());
}

export async function listArticles(params: {
    page: number;
    limit: number;
    status?: string | null;
    category?: string | null;
    source?: string | null;
    search?: string | null;
    orderBy?: "createdAt" | "publishedAt" | "views";
    orderDirection?: "asc" | "desc";
}): Promise<{ items: IArticle[]; total: number }> {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, params.limit);
    const offset = (page - 1) * limit;

    const orderBy = params.orderBy ?? "createdAt";
    const direction = params.orderDirection ?? "desc";
    const base = baseArticleQuery(params);

    const normalizedSearch = params.search?.trim() ?? "";

    if (!normalizedSearch) {
        const ordered = base.orderBy(orderBy, direction);
        const [countSnap, itemsSnap] = await Promise.all([
            ordered.count().get(),
            ordered.offset(offset).limit(limit).get(),
        ]);

        return {
            total: countSnap.data().count,
            items: itemsSnap.docs.map((doc) => mapArticle(doc.id, doc.data())),
        };
    }

    const tokens = chunk(buildSearchTokens(normalizedSearch), 10);
    if (tokens.length === 0) {
        return { items: [], total: 0 };
    }

    const snapshot = await base
        .where("searchTokens", "array-contains-any", tokens)
        .orderBy(orderBy, direction)
        .limit(300)
        .get();

    const all = snapshot.docs.map((doc) => mapArticle(doc.id, doc.data()));

    return {
        total: all.length,
        items: all.slice(offset, offset + limit),
    };
}

export async function updateArticle(id: string, updates: Partial<CreateArticleInput>): Promise<{ previous: IArticle; current: IArticle }> {
    const articleRef = articlesCollection.doc(id);
    let previousArticle: IArticle | null = null;
    let currentArticle: IArticle | null = null;

    await adminDb.runTransaction(async (tx) => {
        const articleSnap = await tx.get(articleRef);

        if (!articleSnap.exists) {
            throw makeError("Article not found", "not-found");
        }

        const existing = articleSnap.data() as ArticleDoc;
        previousArticle = mapArticle(id, existing);

        const now = new Date();

        const slug =
            typeof updates.slug === "string" && updates.slug.trim()
                ? normalizeSlug(updates.slug)
                : existing.slug;

        const title =
            typeof updates.title === "string" && updates.title.trim()
                ? cleanText(updates.title)
                : existing.title;

        const subtitle =
            typeof updates.subtitle === "string"
                ? cleanText(updates.subtitle)
                : existing.subtitle;

        const summary =
            typeof updates.summary === "string" && updates.summary.trim()
                ? cleanText(updates.summary)
                : existing.summary;

        const category =
            typeof updates.category === "string" && updates.category.trim()
                ? cleanText(updates.category)
                : existing.category;

        const tags = updates.tags ? normalizeTags(updates.tags) : existing.tags;
        const seo = updates.seo ? normalizeSeo({ ...existing.seo, ...updates.seo }) : existing.seo;

        const status = updates.status ? normalizeArticleStatus(updates.status) : existing.status;

        const nextNeuraFeedId =
            typeof updates.neuraFeedId === "string" && updates.neuraFeedId.trim()
                ? cleanText(updates.neuraFeedId)
                : updates.neuraFeedId === ""
                    ? undefined
                    : existing.neuraFeedId;

        const nextPublishedAt =
            status === "published"
                ? parsePublishedAt(updates.publishedAt) ?? existing.publishedAt ?? now
                : parsePublishedAt(updates.publishedAt) ?? existing.publishedAt;

        if (slug !== existing.slugLower) {
            await assertSlugAvailable(tx, slug, id, false);
            const existingSlugRef = uniqueSlugsCollection.doc(existing.slugLower);
            const existingSlugSnap = await tx.get(existingSlugRef);
            assertUniqueOwner(existingSlugSnap.data(), id, "Article slug guard mismatch");
            tx.delete(existingSlugRef);
            tx.set(uniqueSlugsCollection.doc(slug), { ownerId: id, createdAt: now });
        }

        if (existing.neuraFeedId && existing.neuraFeedId !== nextNeuraFeedId) {
            const existingNeuraRef = uniqueNeuraFeedIdsCollection.doc(existing.neuraFeedId);
            const existingNeuraSnap = await tx.get(existingNeuraRef);
            assertUniqueOwner(existingNeuraSnap.data(), id, "NeuraFeed guard mismatch");
            tx.delete(existingNeuraRef);
        }

        if (nextNeuraFeedId && nextNeuraFeedId !== existing.neuraFeedId) {
            await assertNeuraFeedIdAvailable(tx, nextNeuraFeedId, id, false);
            tx.set(uniqueNeuraFeedIdsCollection.doc(nextNeuraFeedId), {
                ownerId: id,
                createdAt: now,
            });
        }

        const { neuraFeedId: _existingNeuraFeedId, ...existingWithoutNeuraFeedId } = existing;
        const nextDoc: ArticleDoc = {
            ...existingWithoutNeuraFeedId,
            title,
            slug,
            slugLower: slug,
            subtitle,
            summary,
            category,
            categoryKey: normalizeCategoryKey(category),
            tags,
            tagsLower: tags.map(normalizeTag),
            content_mdx:
                typeof updates.content_mdx === "string"
                    ? updates.content_mdx
                    : existing.content_mdx,
            content_html:
                typeof updates.content_html === "string"
                    ? updates.content_html
                    : existing.content_html,
            status,
            authorId:
                typeof updates.authorId === "string" && updates.authorId.trim()
                    ? updates.authorId
                    : existing.authorId,
            authorName:
                typeof updates.authorName === "string" && updates.authorName.trim()
                    ? cleanText(updates.authorName)
                    : existing.authorName,
            authorEmail:
                typeof updates.authorEmail === "string" && updates.authorEmail.trim()
                    ? normalizeEmail(updates.authorEmail)
                    : existing.authorEmail,
            sources: updates.sources ? normalizeSources(updates.sources) : existing.sources,
            seo,
            publishedAt: nextPublishedAt,
            views: typeof updates.views === "number" ? updates.views : existing.views,
            source: updates.source ? normalizeArticleSource(updates.source) : existing.source,
            ...(nextNeuraFeedId !== undefined ? { neuraFeedId: nextNeuraFeedId } : {}),
            searchTokens: buildSearchTokens(title, subtitle, summary, category, ...tags),
            createdAt: existing.createdAt,
            updatedAt: now,
        };

        tx.set(articleRef, nextDoc);
        currentArticle = mapArticle(id, nextDoc);
    });

    if (!previousArticle || !currentArticle) {
        throw makeError("Failed to update article", "internal");
    }

    return { previous: previousArticle, current: currentArticle };
}

export async function deleteArticle(id: string): Promise<boolean> {
    const articleRef = articlesCollection.doc(id);

    await adminDb.runTransaction(async (tx) => {
        const articleSnap = await tx.get(articleRef);

        if (!articleSnap.exists) {
            throw makeError("Article not found", "not-found");
        }

        const article = articleSnap.data() as ArticleDoc;

        tx.delete(articleRef);
        tx.delete(uniqueSlugsCollection.doc(article.slugLower));
        if (article.neuraFeedId) {
            tx.delete(uniqueNeuraFeedIdsCollection.doc(article.neuraFeedId));
        }
    });

    return true;
}

export async function createRevision(input: {
    articleId: string;
    userId: string;
    changes: Record<string, { old: unknown; new: unknown }>;
}): Promise<IRevision> {
    const now = new Date();
    const revisionRef = revisionsCollection.doc();
    const revisionDoc: RevisionDoc = {
        articleId: input.articleId,
        userId: input.userId,
        changes: input.changes,
        createdAt: now,
    };

    await revisionRef.set(revisionDoc);
    return mapRevision(revisionRef.id, revisionDoc);
}

export async function listRevisions(limit = 100): Promise<IRevision[]> {
    const revisionsSnap = await revisionsCollection
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    const revisions = revisionsSnap.docs.map((doc) => mapRevision(doc.id, doc.data()));

    const articleIds = Array.from(
        new Set(
            revisions
                .map((item) => (typeof item.articleId === "string" ? item.articleId : item.articleId?._id))
                .filter(Boolean)
        )
    ) as string[];

    const userIds = Array.from(
        new Set(
            revisions
                .map((item) => (typeof item.userId === "string" ? item.userId : item.userId?._id))
                .filter(Boolean)
        )
    ) as string[];

    const [articles, users] = await Promise.all([
        Promise.all(articleIds.map((id) => articlesCollection.doc(id).get())),
        Promise.all(userIds.map((id) => usersCollection.doc(id).get())),
    ]);

    const articleMap = new Map<string, { _id: string; title?: string; slug?: string }>();
    for (const snapshot of articles) {
        if (!snapshot.exists) {
            continue;
        }
        const data = snapshot.data() as ArticleDoc;
        articleMap.set(snapshot.id, {
            _id: snapshot.id,
            title: data.title,
            slug: data.slug,
        });
    }

    const userMap = new Map<string, { _id: string; name?: string; email?: string }>();
    for (const snapshot of users) {
        if (!snapshot.exists) {
            continue;
        }
        const data = snapshot.data() as UserDoc;
        userMap.set(snapshot.id, {
            _id: snapshot.id,
            name: data.name,
            email: data.email,
        });
    }

    return revisions.map((revision) => {
        const articleId = typeof revision.articleId === "string" ? revision.articleId : revision.articleId?._id;
        const userId = typeof revision.userId === "string" ? revision.userId : revision.userId?._id;

        return {
            ...revision,
            articleId: articleId ? articleMap.get(articleId) ?? articleId : revision.articleId,
            userId: userId ? userMap.get(userId) ?? userId : revision.userId,
        };
    });
}

export async function getDashboardStats(): Promise<{
    totalArticles: number;
    publishedArticles: number;
    pendingReview: number;
    totalUsers: number;
    recentArticles: IArticle[];
}> {
    const [articlesTotalSnap, publishedSnap, reviewSnap, usersSnap, recentArticlesSnap] =
        await Promise.all([
            articlesCollection.count().get(),
            articlesCollection.where("status", "==", "published").count().get(),
            articlesCollection.where("status", "==", "review").count().get(),
            usersCollection.count().get(),
            articlesCollection.orderBy("createdAt", "desc").limit(5).get(),
        ]);

    return {
        totalArticles: articlesTotalSnap.data().count,
        publishedArticles: publishedSnap.data().count,
        pendingReview: reviewSnap.data().count,
        totalUsers: usersSnap.data().count,
        recentArticles: recentArticlesSnap.docs.map((doc) => mapArticle(doc.id, doc.data())),
    };
}

export async function getHomePageData(): Promise<{
    featuredArticles: IArticle[];
    latestArticles: IArticle[];
    categoryCounts: Record<string, number>;
    neuraFeedArticle: IArticle | null;
}> {
    const [recentSnap, countsSnap] = await Promise.all([
        articlesCollection.orderBy("publishedAt", "desc").limit(50).get(),
        articlesCollection.where("status", "==", "published").get(),
    ]);

    const recentArticles = recentSnap.docs
        .map((doc) => mapArticle(doc.id, doc.data()))
        .filter((article) => article.status === "published");

    const featuredArticles = recentArticles.slice(0, 4);
    const latestArticles = recentArticles.slice(4, 12);
    const neuraFeedArticle =
        recentArticles.find((article) => article.source === "neurafeed") ?? null;

    const categoryCounts: Record<string, number> = {};
    for (const doc of countsSnap.docs) {
        const article = doc.data();
        categoryCounts[article.category] = (categoryCounts[article.category] ?? 0) + 1;
    }

    return {
        featuredArticles,
        latestArticles,
        categoryCounts,
        neuraFeedArticle,
    };
}

export async function listPublishedByCategory(
    category: string,
    page: number,
    limit: number,
): Promise<{ items: IArticle[]; total: number }> {
    return listArticles({
        page,
        limit,
        status: "published",
        category,
        orderBy: "publishedAt",
        orderDirection: "desc",
    });
}

export async function listPublishedByTag(tag: string): Promise<IArticle[]> {
    const snapshot = await articlesCollection
        .where("status", "==", "published")
        .where("tagsLower", "array-contains", normalizeTag(tag))
        .orderBy("publishedAt", "desc")
        .limit(50)
        .get();

    return snapshot.docs.map((doc) => mapArticle(doc.id, doc.data()));
}

export async function listPublishedForLatest(page: number, limit: number): Promise<{ items: IArticle[]; total: number }> {
    return listArticles({
        page,
        limit,
        status: "published",
        orderBy: "publishedAt",
        orderDirection: "desc",
    });
}

export async function listPublishedForTrending(page: number, limit: number): Promise<{ items: IArticle[]; total: number }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const offset = (safePage - 1) * safeLimit;
    const since = new Date(Date.now() - TRENDING_LOOKBACK_DAYS * DAY_MS);

    const viewsSnap = await viewsCollection
        .where("createdAt", ">=", since)
        .orderBy("createdAt", "desc")
        .get();

    const weeklyViewsByArticleId = new Map<string, number>();
    for (const doc of viewsSnap.docs) {
        const view = doc.data();
        weeklyViewsByArticleId.set(
            view.articleId,
            (weeklyViewsByArticleId.get(view.articleId) ?? 0) + 1
        );
    }

    if (weeklyViewsByArticleId.size === 0) {
        return { items: [], total: 0 };
    }

    const rankedArticles = (
        await Promise.all(
            Array.from(weeklyViewsByArticleId.keys()).map(async (articleId): Promise<IArticle | null> => {
                const snapshot = await articlesCollection.doc(articleId).get();
                if (!snapshot.exists) {
                    return null;
                }

                const article = mapArticle(snapshot.id, snapshot.data() as ArticleDoc);
                if (article.status !== "published") {
                    return null;
                }

                return {
                    ...article,
                    weeklyViews: weeklyViewsByArticleId.get(articleId) ?? 0,
                };
            })
        )
    )
        .filter((article): article is IArticle => Boolean(article))
        .sort((a, b) => {
            const viewsDiff = (b.weeklyViews ?? 0) - (a.weeklyViews ?? 0);
            if (viewsDiff !== 0) {
                return viewsDiff;
            }

            return (
                (b.publishedAt?.getTime() ?? 0) -
                (a.publishedAt?.getTime() ?? 0)
            );
        });

    return {
        total: rankedArticles.length,
        items: rankedArticles.slice(offset, offset + safeLimit),
    };
}

export async function listPublishedForFeeds(limit = 50): Promise<IArticle[]> {
    const snapshot = await articlesCollection
        .where("status", "==", "published")
        .orderBy("publishedAt", "desc")
        .limit(limit)
        .get();

    return snapshot.docs.map((doc) => mapArticle(doc.id, doc.data()));
}

export async function listPublishedCategories(): Promise<string[]> {
    const snapshot = await articlesCollection.where("status", "==", "published").get();

    return Array.from(
        new Set(snapshot.docs.map((doc) => doc.data().category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
}

export async function listPublishedForSitemap(): Promise<IArticle[]> {
    const snapshot = await articlesCollection
        .where("status", "==", "published")
        .orderBy("updatedAt", "desc")
        .get();

    return snapshot.docs.map((doc) => mapArticle(doc.id, doc.data()));
}

export async function listPublishedForNewsSitemap(since: Date): Promise<IArticle[]> {
    const snapshot = await articlesCollection
        .where("status", "==", "published")
        .where("publishedAt", ">=", since)
        .orderBy("publishedAt", "desc")
        .get();

    return snapshot.docs.map((doc) => mapArticle(doc.id, doc.data()));
}

function makeDailyViewId(articleId: string, ipAddress: string, dayKey: string): string {
    const hash = crypto
        .createHash("sha256")
        .update(ipAddress)
        .digest("hex")
        .slice(0, 24);
    return `${articleId}_${dayKey}_${hash}`;
}

function dayKeyUTC(date: Date): string {
    const year = date.getUTCFullYear();
    const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${date.getUTCDate()}`.padStart(2, "0");
    return `${year}${month}${day}`;
}

export async function trackArticleView(articleId: string, ipAddress: string): Promise<number | null> {
    if (!ipAddress) {
        return null;
    }

    const now = new Date();
    const dayKey = dayKeyUTC(now);
    const expireAt = new Date(now.getTime() + VIEW_LOG_RETENTION_DAYS * DAY_MS);

    const viewId = makeDailyViewId(articleId, ipAddress, dayKey);
    const viewRef = viewsCollection.doc(viewId);
    const articleRef = articlesCollection.doc(articleId);

    await adminDb.runTransaction(async (tx) => {
        const [viewSnap, articleSnap] = await Promise.all([tx.get(viewRef), tx.get(articleRef)]);

        if (!articleSnap.exists) {
            throw makeError("Article not found", "not-found");
        }

        if (viewSnap.exists) {
            return;
        }

        tx.set(viewRef, {
            articleId,
            ipHash: crypto.createHash("sha256").update(ipAddress).digest("hex"),
            dayKey,
            createdAt: now,
            expireAt,
        });

        tx.update(articleRef, {
            views: FieldValue.increment(1),
            updatedAt: now,
        });
    });

    const article = await getArticleById(articleId);
    return article?.views ?? null;
}

export async function getLatestNeuraFeedImport(): Promise<IArticle | null> {
    const snapshot = await articlesCollection
        .where("source", "==", "neurafeed")
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return mapArticle(doc.id, doc.data());
}
