'use server';
import { FilterQuery } from 'mongoose';
import User from '@/database/user.model';
import Question from '@/database/question.model';
import Tag, { ITag } from '@/database/tag.model';
import { connectToDatabase } from '../mongoose';

import type {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from './shared.types';

export const getTopInteractedTags = async (
  params: GetTopInteractedTagsParams
) => {
  try {
    await connectToDatabase();

    // eslint-disable-next-line no-unused-vars
    const { userId, limit = 3 } = params;

    const user = await User.findById(userId);

    if (!user) throw new Error('User not found!');

    return [
      { _id: 'tag1', name: 'tag1' },
      { _id: 'tag2', name: 'tag2' },
      { _id: 'tag3', name: 'tag3' },
    ];
  } catch (error) {
    console.log(error);
  }
};

export const getAllTags = async (params: GetAllTagsParams) => {
  try {
    await connectToDatabase();

    const tags = await Tag.find({});

    return { tags };
  } catch (error) {
    console.log(error);
  }
};

export const getQuestionByTagId = async (params: GetQuestionsByTagIdParams) => {
  try {
    await connectToDatabase();

    // eslint-disable-next-line no-unused-vars
    const { tagId, page = 1, pageSize = 10, searchQuery } = params;

    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: 'i' } }
        : {},
      options: {
        sort: { createdAt: -1 },
        populate: [
          { path: 'tags', model: Tag, select: '_id name' },
          { path: 'author', model: User, select: '_id clerkId name picture' },
        ],
      },
    });

    if (!tag) throw new Error('Tag not found!');

    const questions = tag?.questions;

    return { tagTitle: tag.name, questions };
  } catch (error) {
    console.log(error);
  }
};
