import Link from 'next/link';

import HomeFilters from '@/components/home/HomeFilters';
import Filter from '@/components/shared/Filter';
import LocalSearch from '@/components/shared/search/LocalSearch';
import { Button } from '@/components/ui/button';

import { HomePageFilters } from '@/constants/filters';
import QuestionCard from '@/components/cards/QuestionCard';
import NoResult from '@/components/shared/NoResult';

const questions = [
  {
    _id: '1',
    title:
      'Best practices for data fetching in a Next.js application with Server-Side Rendering (SSR)?',
    tags: [
      { _id: '1', name: 'next.js' },
      { _id: '2', name: 'react.js' },
    ],
    author: { _id: 'authorId1', name: 'John Doe', picture: 'john-doe.jpg' },
    upvotes: 1150,
    views: 105080,
    answers: [
      {
        /* answer object properties here */
      },
      {
        /* answer object properties here */
      },
    ],
    createdAt: new Date('2024-01-04T12:53:06.000Z'),
  },
  {
    _id: '2',
    title: 'Redux Toolkit Not Updating State as Expected',
    tags: [
      { _id: '2', name: 'react.js' },
      { _id: '3', name: 'redux' },
    ],
    author: {
      _id: 'authorId2',
      name: 'Angela Smith',
      picture: 'angela-smith.jpg',
    },
    upvotes: 10689,
    views: 498689,
    answers: [
      {
        /* answer object properties here */
      },
      {
        /* answer object properties here */
      },
      // additional answer objects as needed
    ],
    createdAt: new Date('2023-12-08T10:25:08.000Z'),
  },
];

export default function Home() {
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for Questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>
      <HomeFilters />
      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionCard key={question._id} {...question} />
          ))
        ) : (
          <NoResult
            title="There are no question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
}
