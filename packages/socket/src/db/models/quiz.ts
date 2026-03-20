import mongoose, { Document, Schema } from "mongoose";

export interface IQuiz extends Document {
  subject: string;
  background?: string;
  autoNextDelay?: number;
  questions: {
    question: string;
    answers: string[];
    solution: number;
    cooldown: number;
    time: number;
    image?: string;
    video?: string;
    audio?: string;
    background?: string;
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema({
  question: { type: String, required: true },
  answers: [{ type: String }],
  solution: { type: Number, required: true },
  cooldown: { type: Number, required: true },
  time: { type: Number, required: true },
  image: String,
  video: String,
  audio: String,
  background: String,
});

const quizSchema = new Schema<IQuiz>(
  {
    subject: { type: String, required: true },
    background: String,
    autoNextDelay: { type: Number, default: null },
    questions: [questionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);
