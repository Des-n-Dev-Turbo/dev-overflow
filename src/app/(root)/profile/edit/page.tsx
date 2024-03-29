import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import Profile from '@/components/forms/Profile';
import { getUserById } from '@/lib/actions/user.action';

const EditProfilePage = async () => {
  const { userId } = auth();

  if (!userId) redirect('/sign-in');

  const mongoUser = await getUserById({ userId });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <div>
        <Profile clerkId={userId} user={JSON.stringify(mongoUser)} />
      </div>
    </div>
  );
};

export default EditProfilePage;
