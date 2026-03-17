import mongoose, { Document, Schema } from "mongoose";

export interface IGameResult extends Document {
  quizzId: mongoose.Types.ObjectId;
  quizzSubject: string;
  playedAt: Date;
  totalPlayers: number;
  createdBy: string;
  players: {
    username: string;
    totalPoints: number;
    rank: number;
  }[];
  questions: {
    questionIndex: number;
    questionText: string;
    correctAnswerIndex: number;
    answers: string[];
    playerResults: {
      username: string;
      answerId: number | null;
      correct: boolean;
      points: number;
    }[];
  }[];
}

const gameResultSchema = new Schema<IGameResult>({
  quizzId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  quizzSubject: { type: String, required: true },
  playedAt: { type: Date, default: Date.now },
  totalPlayers: { type: Number, required: true },
  createdBy: { type: String, required: true },
  players: [
    {
      username: String,
      totalPoints: Number,
      rank: Number,
    },
  ],
  questions: [
    {
      questionIndex: Number,
      questionText: String,
      correctAnswerIndex: Number,
      answers: [String],
      playerResults: [
        {
          username: String,
          answerId: { type: Number, default: null },
          correct: Boolean,
          points: Number,
        },
      ],
    },
  ],
});

export const GameResult = mongoose.model<IGameResult>(
  "GameResult",
  gameResultSchema,
);
