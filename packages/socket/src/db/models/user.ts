import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: "admin";
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
