import mongoose, { Schema, Model } from "mongoose";
import { ISource } from "@/types";

const SourceSchema = new Schema<ISource>(
    {
        name: {
            type: String,
            required: [true, "Source name is required"],
            trim: true,
        },
        url: {
            type: String,
            required: [true, "Source URL is required"],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Source: Model<ISource> =
    mongoose.models.Source || mongoose.model<ISource>("Source", SourceSchema);

export default Source;
