import { Quiz, IQuiz } from "@quizio/socket/db/models/quiz";
import mongoose from "mongoose";

export interface QuizListItem {
  id: string;
  subject: string;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const quizService = {
  async list(search?: string, sort?: string): Promise<QuizListItem[]> {
    const query: any = {};
    if (search) {
      query.subject = { $regex: search, $options: "i" };
    }
    const sortOption: any =
      sort === "name" ? { subject: 1 } : { updatedAt: -1 };
    const quizzes = await Quiz.find(query).sort(sortOption).lean();
    return quizzes.map((q) => ({
      id: q._id.toString(),
      subject: q.subject,
      questionCount: q.questions.length,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));
  },

  async getById(id: string): Promise<IQuiz | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Quiz.findById(id).lean() as any;
  },

  async create(data: any, userId: string): Promise<IQuiz> {
    const quiz = new Quiz({
      ...data,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    return quiz.save();
  },

  async update(id: string, data: any): Promise<IQuiz | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Quiz.findByIdAndUpdate(id, data, { new: true }).lean() as any;
  },

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Quiz.findByIdAndDelete(id);
    return !!result;
  },
};
