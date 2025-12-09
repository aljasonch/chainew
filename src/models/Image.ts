import mongoose, { Document, Model, Schema } from "mongoose";

export interface IImage extends Document {
    data: Buffer;
    contentType: string;
    filename: string;
    createdAt: Date;
}

const ImageSchema: Schema = new Schema({
    data: {
        type: Buffer,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Image: Model<IImage> =
    mongoose.models.Image || mongoose.model<IImage>("Image", ImageSchema);

export default Image;
