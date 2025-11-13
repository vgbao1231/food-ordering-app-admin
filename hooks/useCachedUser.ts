import Cookies from 'js-cookie';
import { decodeJwtPayload } from '@/lib/utils';
import { useMeQuery, User } from '@/features/auth/authApi';

export const useCachedUser = () => {
  const accessToken = Cookies.get('accessToken');
  const userInfo = decodeJwtPayload(accessToken);
  const userId = userInfo?.id;

  const { data: user, isLoading } = useMeQuery(userId, {
    skip: !userId,
    selectFromResult: (result: any) => ({
      data: result.data as User | undefined,
      isLoading: result.isLoading,
    }),
  });

  return { user, isLoading };
};
