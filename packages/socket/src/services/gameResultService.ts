import { GameResult, IGameResult } from "@quizio/socket/db/models/gameResult";
import mongoose from "mongoose";

export interface GameResultPayload {
  quizzId: string;
  quizzSubject: string;
  totalPlayers: number;
  createdBy: string;
  players: { username: string; totalPoints: number; rank: number }[];
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

export const gameResultService = {
  async save(data: GameResultPayload): Promise<IGameResult> {
    const result = new GameResult({
      ...data,
      quizzId: new mongoose.Types.ObjectId(data.quizzId),
      playedAt: new Date(),
    });
    return result.save();
  },

  async list(filter?: {
    quizzId?: string;
    from?: string;
    to?: string;
    page?: number;
  }): Promise<IGameResult[]> {
    const query: any = {};
    if (filter?.quizzId && mongoose.Types.ObjectId.isValid(filter.quizzId)) {
      query.quizzId = new mongoose.Types.ObjectId(filter.quizzId);
    }
    if (filter?.from || filter?.to) {
      query.playedAt = {};
      if (filter.from) query.playedAt.$gte = new Date(filter.from);
      if (filter.to) query.playedAt.$lte = new Date(filter.to);
    }
    const page = filter?.page || 1;
    const limit = 20;
    return GameResult.find(query)
      .sort({ playedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean() as any;
  },

  async getById(id: string): Promise<IGameResult | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return GameResult.findById(id).lean() as any;
  },
};
