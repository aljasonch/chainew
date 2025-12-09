import mongoose, { Schema, Model, Document } from "mongoose";

export interface IView extends Document {
    articleId: mongoose.Types.ObjectId;
    ip: string;
    createdAt: Date;
}

const ViewSchema: Schema = new Schema({
    articleId: {
        type: Schema.Types.ObjectId,
        ref: "Article",
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, 
    },
});

ViewSchema.index({ articleId: 1, ip: 1 }, { unique: true });

const View: Model<IView> =
    mongoose.models.View || mongoose.model<IView>("View", ViewSchema);

export default View;
