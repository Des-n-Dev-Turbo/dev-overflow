'use server';
import { revalidatePath } from 'next/cache';

import { connectToDatabase } from '../mongoose';

import Question from '@/database/question.model';
import Answer from '@/database/answer.model';
import Interaction from '@/database/interaction.model';
import User from '@/database/user.model';

import type {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
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

    const questionObject = await Question.findByIdAndUpdate(question, {
      $push: { answers: answer._id },
    });

    //* Add Interaction and increase or decrease user reputation
    await Interaction.create({
      user: author,
      answer: answer._id,
      action: 'answer',
      question,
      tags: questionObject.tags,
    });

    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const getAnswers = async (params: GetAnswersParams) => {
  try {
    await connectToDatabase();

    const { questionId, sortBy, page = 1, pageSize = 10 } = params;

    let sortOptions = {};

    switch (sortBy) {
      case 'highestUpvotes':
        sortOptions = { upvotes: -1 };
        break;
      case 'lowestUpvotes':
        sortOptions = { upvotes: 1 };
        break;
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'old':
        sortOptions = { createdAt: 1 };
        break;
      default:
        break;
    }

    const skipAmount = (page - 1) * pageSize;

    const answers = await Answer.find({ question: questionId })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('author', '_id clerkId picture name')
      .sort(sortOptions);

    const totalAnswers = await Answer.countDocuments({ question: questionId });

    const isNext = totalAnswers > answers.length + skipAmount;

    return { answers, isNext };
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

    //* Increment the user reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -2 : 2 },
    });

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasupVoted ? -10 : 10 },
    });

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

    //* Increase user reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownVoted ? -2 : 2 },
    });

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasdownVoted ? -10 : 10 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const deleteAnswer = async (params: DeleteAnswerParams) => {
  try {
    await connectToDatabase();

    const { answerId, path } = params;

    const answer = await Answer.findById(answerId);

    if (!answer) throw new Error('Could not find answer!');

    await Answer.deleteOne({ _id: answerId });

    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answer._id } }
    );

    await Interaction.deleteMany({ answer: answer._id });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};
