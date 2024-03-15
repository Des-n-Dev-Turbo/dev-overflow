'use server';
import { revalidatePath } from 'next/cache';

import { connectToDatabase } from '../mongoose';

import Question from '@/database/question.model';
import Answer from '@/database/answer.model';

import type {
  AnswerVoteParams,
  CreateAnswerParams,
  GetAnswersParams,
} from './shared.types';

export const createAnswer = async (params: CreateAnswerParams) => {
  try {
    await connectToDatabase();

    const { content, author, question, path } = params;

    const answer = await Answer.create({
      content,
      author,
      question,
    });

    await Question.findByIdAndUpdate(question, {
      $push: { answers: answer._id },
    });

    // TODO: Add Interaction
    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const getAnswers = async (params: GetAnswersParams) => {
  try {
    await connectToDatabase();

    const { questionId } = params;

    const answers = await Answer.find({ question: questionId })
      .populate('author', '_id clerkId picture name')
      .sort({ createdAt: -1 });

    return { answers };
  } catch (error) {
    console.log(error);
  }
};

export const upvoteAnswer = async (params: AnswerVoteParams) => {
  try {
    await connectToDatabase();

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) throw new Error('Could not find answer!');

    // TODO: Increment the user reputation

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const downvoteAnswer = async (params: AnswerVoteParams) => {
  try {
    await connectToDatabase();

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) throw new Error('Could not find answer!');

    // TODO: Increase user reputation

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};
