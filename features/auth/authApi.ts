import { baseApi, tagTypes } from '../api/baseApi';

interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phonenumber: string;
  gender: string;
  role: string;
  avatar: any;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<User, LoginPayload>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
        credentials: 'include',
      }),
      invalidatesTags: [tagTypes.Auth],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: [tagTypes.Auth],
    }),

    me: builder.query<User, string>({
      query: (id) => ({
        url: `/user/${id}`,
        credentials: 'include',
      }),
      providesTags: [tagTypes.Auth],
    }),
    updateProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: `/user/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [tagTypes.Account],
    }),
    changePassword: builder.mutation<any, any>({
      query: (body) => ({
        url: '/auth/password',
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
