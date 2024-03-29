import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';

import Question from '@/components/forms/Question';

import { getUserById } from '@/lib/actions/user.action';
import { getQuestionById } from '@/lib/actions/question.action';

import { ParamsProps } from '@/types';

const EditQuestionPage = async ({ params }: ParamsProps) => {
  const { userId } = auth();

  if (!userId) redirect('/sign-in');

  const mongoUser = await getUserById({ userId });

  const result = await getQuestionById({ questionId: params.id });

  if (result.author.clerkId !== userId) redirect('/');

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>
      <div>
        <Question
          type="Edit"
          mongoUserId={JSON.stringify(mongoUser._id)}
          questionDetails={JSON.stringify(result)}
        />
      </div>
    </div>
  );
};

export default EditQuestionPage;
