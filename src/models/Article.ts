import mongoose, { Schema, Model } from "mongoose";
import { IArticle } from "@/types";

const ArticleSourceSchema = new Schema(
    {
        name: { type: String, required: true },
        url: { type: String, required: true },
    },
    { _id: false }
);

const ArticleSeoSchema = new Schema(
    {
        metaTitle: { type: String, required: true },
        metaDescription: { type: String, required: true },
        ogImageUrl: { type: String },
    },
    { _id: false }
);

const ArticleSchema = new Schema<IArticle>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        subtitle: {
            type: String,
            trim: true,
        },
        summary: {
            type: String,
            required: [true, "Summary is required"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        content_mdx: {
            type: String,
            default: "",
        },
        content_html: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["draft", "review", "published"],
            default: "draft",
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sources: {
            type: [ArticleSourceSchema],
            default: [],
        },
        seo: {
            type: ArticleSeoSchema,
            required: true,
        },
        publishedAt: {
            type: Date,
        },
        views: {
            type: Number,
            default: 0,
        },
        source: {
            type: String,
            enum: ["neurafeed", "manual"],
            default: "manual",
        },
        neuraFeedId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ authorId: 1 });
ArticleSchema.index({ neuraFeedId: 1 }, { sparse: true, unique: true });

// Force recompile during dev to clear old schema caches
if (process.env.NODE_ENV !== "production") {
    delete mongoose.models.Article;
}

const Article: Model<IArticle> =
    mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
