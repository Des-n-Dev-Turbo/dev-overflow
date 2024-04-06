import Filter from './Filter';

import { getAnswers } from '@/lib/actions/answer.action';

import { AnswerFilters } from '@/constants/filters';
import Link from 'next/link';
import Image from 'next/image';
import { getTimestamp } from '@/lib/utils';
import ParseHTML from './ParseHTML';
import Voting from './Voting';

interface AllAnswerProps {
  questionId: string;
  userId: string;
  totalAnswers: number;
  page?: number;
  filter?: string;
}

const AllAnswers = async ({
  questionId,
  userId,
  totalAnswers,
  page,
  filter,
}: AllAnswerProps) => {
  const result = await getAnswers({
    questionId,
    page: page ? +page : 1,
    sortBy: filter,
  });

  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{totalAnswers} Answers</h3>
        <Filter filters={AnswerFilters} />
      </div>
      <div>
        {result?.answers &&
          result?.answers.map((answer) => (
            <article
              key={answer._id}
              className="light-border border-b py-10"
              id={JSON.stringify(answer._id)}
            >
              <div className="flex items-center justify-between">
                <div className="mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                  <Link
                    href={`/profile/${answer.author.clerkId}`}
                    className="flex flex-1 items-start gap-1 sm:items-center"
                  >
                    <Image
                      src={answer.author.picture}
                      width={18}
                      height={18}
                      alt="Profile Picture"
                      className="rounded-full object-cover max-sm:mt-0.5"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className="body-semibold text-dark300_light700">
                        {answer.author.name}
                      </p>
                      <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
                        answered {getTimestamp(answer.createdAt)}
                      </p>
                    </div>
                  </Link>
                  <div className="flex justify-end">
                    <Voting
                      type="Answer"
                      itemId={JSON.stringify(answer?._id)}
                      userId={userId}
                      upvotes={answer?.upvotes.length}
                      hasUpvoted={answer?.upvotes.includes(JSON.parse(userId))}
                      downvotes={answer?.downvotes.length}
                      hasDownvoted={answer?.downvotes.includes(
                        JSON.parse(userId)
                      )}
                    />
                  </div>
                </div>
              </div>
              <ParseHTML data={answer.content} />
            </article>
          ))}
      </div>
    </div>
  );
};
export default AllAnswers;
