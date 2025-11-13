import { baseApi, tagTypes } from '../api/baseApi';

export const adminAccountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAccounts: builder.query<any, void>({
      query: () => '/admin/accounts',
      providesTags: (result) => {
        const accounts = result?.data || [];

        if (Array.isArray(accounts) && accounts.length > 0) {
          return [
            { type: tagTypes.Account, id: 'LIST' },
            ...accounts.map((admin) => ({
              type: tagTypes.Account,
              id: admin._id,
            })),
          ];
        }

        return [{ type: tagTypes.Account, id: 'LIST' }];
      },
    }),

    createAccount: builder.mutation<any, any>({
      query: (newAccountData) => ({
        url: `/admin/accounts`,
        method: 'POST',
        body: newAccountData,
      }),
      invalidatesTags: [{ type: tagTypes.Account, id: 'LIST' }],
    }),

    updateAccountInfo: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin/accounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      // Cập nhật item và danh sách
      invalidatesTags: (result, error, { id }) => [
        { type: tagTypes.Account, id },
        { type: tagTypes.Account, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountInfoMutation,
} = adminAccountApi;
