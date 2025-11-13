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
  token: string;
  refreshToken: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface CheckOtpPayload {
  email: string;
  otp: string;
}

interface ResetPasswordPayload {
  email: string;
  newPassword: string;
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
      providesTags: (result, error, id) => [{ type: tagTypes.Account, id }],
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
        url: '/auth/change-password',
        method: 'PUT',
        body,
      }),
    }),

    forgotPassword: builder.mutation<
      { success: boolean; message: string },
      ForgotPasswordPayload
    >({
      query: (body) => ({
        url: '/auth/forgot-password', // Thay đổi URL nếu cần
        method: 'POST',
        body,
      }),
    }),

    checkOtp: builder.mutation<
      { success: boolean; token: string },
      CheckOtpPayload
    >({
      query: (body) => ({
        url: '/auth/check-otp',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { success: boolean; message: string },
      ResetPasswordPayload
    >({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'PUT',
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
  useCheckOtpMutation,
  useResetPasswordMutation,
  useForgotPasswordMutation,
} = authApi;
