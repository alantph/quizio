import { z } from "zod";

export const questionSchema = z
  .object({
    question: z.string().min(1).max(500),
    answers: z.array(z.string().min(1)).min(2).max(4),
    solution: z.number().int().min(0),
    cooldown: z.number().int().min(1).max(30),
    time: z.number().int().min(5).max(120),
    image: z.string().url().optional().or(z.literal("")),
    video: z.string().url().optional().or(z.literal("")),
    audio: z.string().url().optional().or(z.literal("")),
    background: z.string().url().optional().or(z.literal("")),
  })
  .refine((data) => data.solution < data.answers.length, {
    message: "solution must be within answers bounds",
    path: ["solution"],
  });

export const quizSchema = z.object({
  subject: z.string().min(1).max(100),
  background: z.string().url().optional().or(z.literal("")),
  questions: z.array(questionSchema).min(1).max(50),
});

export type QuizInput = z.infer<typeof quizSchema>;
