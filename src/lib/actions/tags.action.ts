'use server';
import User from '@/database/user.model';
import Tag from '@/database/tag.model';
import { connectToDatabase } from '../mongoose';

import type {
  GetAllTagsParams,
  GetTopInteractedTagsParams,
} from './shared.types';

export const getTopInteractedTags = async (
  params: GetTopInteractedTagsParams
) => {
  try {
    await connectToDatabase();

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
