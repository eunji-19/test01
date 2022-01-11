import { Document, Schema, model } from "mongoose";
import { AutoIncrementSimple } from "@typegoose/auto-increment";
import { BrainTokenSchema } from "./brainToken";

export interface User {
  nickname: string;
  email: string;
  password: string;
  date?: Date;
  seq?: number;
  access_token?: string;
  brainToken?: any;
}

const UserSchema = new Schema(
  {
    nickname: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    seq: { type: Number, required: true, default: 0 },
    access_token: { type: String },
    brainToken: [BrainTokenSchema],
    // brainToken: {
    //   type: Schema.Types.ObjectId,
    //   ref: "BrainToken",
    // },
  },
  {
    timestamps: true,
  }
);

/**
 * @typegoose/auto-increment
 * https://issueexplorer.com/issue/typegoose/auto-increment/9
 */
UserSchema.plugin(AutoIncrementSimple, [{ field: "seq", incrementBy: 1 }]);

export const UserModel = model<User & Document>("User", UserSchema);
