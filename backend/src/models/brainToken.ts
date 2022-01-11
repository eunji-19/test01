import { Document, Schema, model } from "mongoose";

export interface BrainToken {
  email: string;
  clientToken: string;
  clientToken_expires: number;
  generateToken: string;
  generateToken_expires: number;
  date?: Date;
}

export const BrainTokenSchema = new Schema(
  {
    email: { type: String, required: true },
    clientToken: { type: String, required: true },
    clientToken_expires: { type: Number, required: true },
    generateToken: { type: String, required: true },
    generateToken_expires: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const BrainTokenModel = model<BrainToken & Document>(
  "BrainToken",
  BrainTokenSchema
);
