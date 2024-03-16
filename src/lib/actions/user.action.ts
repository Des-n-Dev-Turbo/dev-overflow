'use server';
import { FilterQuery } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from './../mongoose';

import User from '@/database/user.model';
import Question from '@/database/question.model';
import Tag from '@/database/tag.model';

import type {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from './shared.types';

export const getUserById = async (params: GetUserByIdParams) => {
  try {
    await connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createUser = async (userData: CreateUserParams) => {
  try {
    await connectToDatabase();

    const newUser = await User.create(userData);

    console.log(`New User - ${newUser._id} created Successfully`);
    return newUser;
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (params: UpdateUserParams) => {
  try {
    await connectToDatabase();

    const { clerkId, updateData, path } = params;

    const updatedUser = await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
      upsert: true,
    }).catch((err) => console.log({ err }));

    console.log({ updatedUser });

    revalidatePath(path);
    // console.log(`User - ${updatedUser._id} updated Successfully`);
    return updatedUser;
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (params: DeleteUserParams) => {
  try {
    await connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOne({ clerkId });

    if (!user) {
      throw new Error('User not found!');
    }

    // TODO: Delete user from the User Db

    // eslint-disable-next-line no-unused-vars
    const userQuestionIds = await Question.find({ author: user._id }).distinct(
      '_id'
    );

    await Question.deleteMany({ author: user._id });

    // TODO: Delete answer for all the questions

    const deletedUser = await User.findOneAndDelete({ clerkId });

    return deletedUser;
  } catch (error) {
    console.log(error);
  }
};

export const getAllUsers = async (params: GetAllUsersParams) => {
  try {
    await connectToDatabase();

    // eslint-disable-next-line no-unused-vars
    const { page = 1, pageSize = 20, filter, searchQuery } = params;

    const users = await User.find({}).sort({ createdAt: -1 });

    return { users };
  } catch (error) {
    console.log(error);
  }
};

export const toggleSaveQuestion = async (params: ToggleSaveQuestionParams) => {
  try {
    await connectToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) throw new Error('User not found!');

    const isQuestionSaved = user.saved.includes(questionId);

    if (isQuestionSaved) {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true }
      );
    } else {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const getSavedQuestions = async (params: GetSavedQuestionsParams) => {
  try {
    await connectToDatabase();

    // eslint-disable-next-line no-unused-vars
    const { clerkId, searchQuery, page, pageSize, filter } = params;

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, 'i') } }
      : {};

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: { createdAt: -1 },
        populate: [
          { path: 'tags', model: Tag, select: '_id name' },
          {
            path: 'author',
            model: User,
            select: '_id clerkId name picture',
          },
        ],
      },
    });

    if (!user) throw new Error('User not found!');

    const savedQuestions = user.saved;

    return { questions: savedQuestions };
  } catch (error) {
    console.log(error);
  }
};
