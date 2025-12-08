import mongoose, { Schema, Model } from "mongoose";
import { IRevision } from "@/types";

const RevisionSchema = new Schema<IRevision>(
    {
        articleId: {
            type: Schema.Types.ObjectId,
            ref: "Article",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        changes: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient lookups
RevisionSchema.index({ articleId: 1, createdAt: -1 });

const Revision: Model<IRevision> =
    mongoose.models.Revision ||
    mongoose.model<IRevision>("Revision", RevisionSchema);

export default Revision;
