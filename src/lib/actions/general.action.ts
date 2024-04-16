'use server';
import { connectToDatabase } from '../mongoose';
import Answer from '@/database/answer.model';
import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import User from '@/database/user.model';

import { SearchParams } from './shared.types';

const SearchableTypes = ['question', 'tag', 'user', 'answer'];

export const globalSearch = async (params: SearchParams) => {
  try {
    await connectToDatabase();

    const { query, type } = params;

    const regexQuery = {
      $regex: query,
      $options: 'i',
    };

    let results = [];

    const modelsAndTypes = [
      { model: Question, searchField: 'title', type: 'question' },
      { model: Tag, searchField: 'name', type: 'tag' },
      { model: User, searchField: 'name', type: 'user' },
      { model: Answer, searchField: 'content', type: 'answer' },
    ];

    const typeLower = type?.toLowerCase();

    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      // Search Across everything
      for (const modelInfo of modelsAndTypes) {
        const queryResult = await modelInfo.model
          .find({
            [modelInfo.searchField]: regexQuery,
          })
          .limit(2);

        results.push(
          ...queryResult.map((item) => ({
            title:
              modelInfo.type === 'answer'
                ? `Answers containing ${query}`
                : item[modelInfo.searchField],
            type: modelInfo.type,
            id:
              modelInfo.type === 'user'
                ? item.clerkId
                : modelInfo.type === 'answer'
                  ? item.question
                  : item._id,
          }))
        );
      }
    } else {
      // Search in specified Model Type
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower);

      if (!modelInfo) throw new Error('Invalid search Type');

      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8);

      results = queryResults.map((item) => ({
        title:
          typeLower === 'answer'
            ? `Answers containing ${query}`
            : item[modelInfo.searchField],
        type: typeLower,
        id:
          typeLower === 'user'
            ? item.clerkId
            : typeLower === 'answer'
              ? item.question
              : item._id,
      }));
    }

    return JSON.stringify(results);
  } catch (error) {
    console.log(error);
  }
};
