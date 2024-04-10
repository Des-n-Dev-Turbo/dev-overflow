'use server';
import { revalidatePath } from 'next/cache';
import { FilterQuery } from 'mongoose';

import { connectToDatabase } from './../mongoose';

import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import User from '@/database/user.model';
import Answer from '@/database/answer.model';
import Interaction from '@/database/interaction.model';

import type {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from './shared.types';

export const getQuestions = async (params: GetQuestionsParams) => {
  try {
    await connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 20 } = params;

    const query: FilterQuery<typeof Question> = {};

    if (searchQuery) {
      query.$or = [
        {
          title: { $regex: new RegExp(searchQuery, 'i') },
        },
        {
          content: { $regex: new RegExp(searchQuery, 'i') },
        },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'frequent':
        sortOptions = { views: -1 };
        break;
      case 'unanswered':
        query.answers = { $size: 0 };
        break;
      default:
        break;
    }

    const skipAmount = (page - 1) * pageSize;

    const questions = await Question.find(query)
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalQuestions = await Question.countDocuments(query);

    const isNext = totalQuestions > skipAmount + questions.length;

    return { questions, isNext };
  } catch (error) {
    console.log(error);
  }
};

export const createQuestion = async (params: CreateQuestionParams) => {
  try {
    await connectToDatabase();

    const { title, content, tags, author, path } = params;

    // Create the question
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // Create the tags or get them if they already exist
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true }
      );

      tagDocuments.push(existingTag._id);
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // TODO: Create an interaction record for the user's ask_question action

    // TODO: Increment author's reputation by +5 for creating a question

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const getQuestionById = async (params: GetQuestionByIdParams) => {
  try {
    await connectToDatabase();

    const id = params.questionId;

    const questionDetails = await Question.findById(id)
      .populate({
        path: 'tags',
        model: Tag,
        select: '_id name',
      })
      .populate({
        path: 'author',
        model: User,
        select: '_id clerkId name picture',
      });

    return questionDetails;
  } catch (error) {
    console.log(error);
  }
};

export const upvoteQuestion = async (params: QuestionVoteParams) => {
  try {
    await connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) throw new Error('Question not found!');

    // TODO: Increase user reputation

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const downvoteQuestion = async (params: QuestionVoteParams) => {
  try {
    await connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) throw new Error('Question not found!');

    // TODO: Increase user reputation

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const deleteQuestion = async (params: DeleteQuestionParams) => {
  try {
    await connectToDatabase();

    const { questionId, path } = params;

    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    await Answer.deleteMany({ question: deletedQuestion._id });

    await Interaction.deleteMany({ question: deletedQuestion._id });

    await Tag.updateMany(
      { questions: deletedQuestion._id },
      { $pull: { questions: deletedQuestion._id } }
    );

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const editQuestion = async (params: EditQuestionParams) => {
  try {
    await connectToDatabase();

    const { questionId, title, content, path } = params;

    const question = await Question.findById(questionId);

    if (!question) throw new Error('Question not found!');

    question.title = title;
    question.content = content;

    await question.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const getHotQuestions = async () => {
  try {
    await connectToDatabase();

    const hotQuestions = await Question.find()
      .sort({ views: -1, upvotes: -1 })
      .limit(5);

    return hotQuestions;
  } catch (error) {
    console.log(error);
  }
};
