'use client';
import { useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

import { toast } from '../ui/use-toast';
import { formatLargeNumber } from '@/lib/utils';
import {
  downvoteQuestion,
  upvoteQuestion,
} from '@/lib/actions/question.action';
import { downvoteAnswer, upvoteAnswer } from '@/lib/actions/answer.action';
import { toggleSaveQuestion } from '@/lib/actions/user.action';
import { viewQuestion } from '@/lib/actions/interaction.action';

interface VotingProps {
  type: 'Question' | 'Answer';
  userId: string;
  itemId: string;
  upvotes: number;
  hasUpvoted: boolean;
  downvotes: number;
  hasDownvoted: boolean;
  hasSaved?: boolean;
}

const Voting = ({
  type,
  userId,
  itemId,
  upvotes,
  hasUpvoted,
  downvotes,
  hasDownvoted,
  hasSaved,
}: VotingProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    viewQuestion({
      userId: userId ? JSON.parse(userId) : null,
      questionId: type === 'Question' ? JSON.parse(itemId) : params.id,
    });
  }, [userId, itemId, pathname, router, params.id, type]);

  const handleSave = async () => {
    if (!userId) {
      return;
    }

    await toggleSaveQuestion({
      userId: JSON.parse(userId),
      questionId: JSON.parse(itemId),
      path: pathname,
    });

    return toast({
      title: `Question ${!hasSaved ? 'Saved in' : 'Removed from'} your collection`,
      variant: !hasSaved ? 'default' : 'destructive',
    });
  };

  const handleVote = async (voteType: string) => {
    if (!userId) {
      return toast({
        title: 'Please log in',
        description: 'You must be logged in to perform this action',
      });
    }

    const paramsObj = {
      userId: JSON.parse(userId),
      hasupVoted: hasUpvoted,
      hasdownVoted: hasDownvoted,
      path: pathname,
    };

    if (voteType === 'upvote') {
      if (type === 'Question') {
        await upvoteQuestion({ ...paramsObj, questionId: JSON.parse(itemId) });
      } else if (type === 'Answer') {
        await upvoteAnswer({ ...paramsObj, answerId: JSON.parse(itemId) });
      }

      //* Show toast for upvoting question/answer
      return toast({
        title: `Upvote ${!hasUpvoted ? 'Successful' : 'Removed'}`,
        variant: !hasUpvoted ? 'default' : 'destructive',
      });
    }
    if (voteType === 'downvote') {
      if (type === 'Question') {
        await downvoteQuestion({
          ...paramsObj,
          questionId: JSON.parse(itemId),
        });
      } else if (type === 'Answer') {
        await downvoteAnswer({ ...paramsObj, answerId: JSON.parse(itemId) });
      }

      //* Show toast for downvoting question/answer
      return toast({
        title: `Downvote ${!hasDownvoted ? 'Successful' : 'Removed'}`,
        variant: !hasDownvoted ? 'default' : 'destructive',
      });
    }
  };

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasUpvoted
                ? '/assets/icons/upvoted.svg'
                : '/assets/icons/upvote.svg'
            }
            alt="Upvote Icon"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote('upvote')}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatLargeNumber(upvotes)}
            </p>
          </div>
        </div>
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasDownvoted
                ? '/assets/icons/downvoted.svg'
                : '/assets/icons/downvote.svg'
            }
            alt="Downvote Icon"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote('downvote')}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatLargeNumber(downvotes)}
            </p>
          </div>
        </div>
      </div>
      {type === 'Question' && (
        <Image
          src={
            hasSaved
              ? '/assets/icons/star-filled.svg'
              : '/assets/icons/star-red.svg'
          }
          alt="Favorite Icon"
          width={18}
          height={18}
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Voting;
