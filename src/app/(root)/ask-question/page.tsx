import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';

import Question from '@/components/forms/Question';

import { getUserById } from '@/lib/actions/user.action';

const AskQuestionPage = async () => {
  const { userId } = auth();

  if (!userId) redirect('/sign-in');

  const mongoUser = await getUserById({ userId });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a Question</h1>
      <div>
        <Question type="Create" mongoUserId={JSON.stringify(mongoUser._id)} />
      </div>
    </div>
  );
};

export default AskQuestionPage;
