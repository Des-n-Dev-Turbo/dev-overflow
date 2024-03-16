'use server';
import { connectToDatabase } from '../mongoose';
import Question from '@/database/question.model';

import type { ViewQuestionParams } from './shared.types';
import Interaction from '@/database/interaction.model';

export const viewQuestion = async (params: ViewQuestionParams) => {
  try {
    await connectToDatabase();

    const { questionId, userId } = params;

    // Update Viewcount for Question currently being viewed
    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

    if (userId) {
      const existingInteraction = await Interaction.findOne({
        user: userId,
        question: questionId,
        action: 'view',
      });

      if (existingInteraction)
        return console.log('User has already viewed the question!');

      await Interaction.create({
        user: userId,
        question: questionId,
        action: 'view',
      });
    }
  } catch (error) {
    console.log(error);
  }
};
