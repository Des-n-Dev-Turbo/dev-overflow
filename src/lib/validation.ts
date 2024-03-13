import * as z from 'zod';

export const QuestionsSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be atleast 5 characters long.')
    .max(130, 'Title can be 130 characters at most.'),
  explanation: z.string().min(20),
  tags: z.array(z.string().min(1).max(15)).min(1).max(3),
});

export const AnswerSchema = z.object({
  answer: z.string().min(100),
});
