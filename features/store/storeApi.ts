import { baseApi, tagTypes } from '../api/baseApi';

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllStores: builder.query<any, void>({
      query: () => '/admin/stores',
      providesTags: (result) => {
        const stores = result?.data || [];

        if (Array.isArray(stores) && stores.length > 0) {
          return [
            { type: tagTypes.Store, id: 'LIST' },

            ...stores.map((store) => ({
              type: tagTypes.Store,
              id: store._id,
            })),
          ];
        }

        return [{ type: tagTypes.Store, id: 'LIST' }];
      },
    }),

    getStoreById: builder.query<any, string>({
      query: (id) => `/admin/stores/${id}`,
      providesTags: (result, error, id) => [{ type: tagTypes.Store, id }],
    }),

    approveStore: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/stores/approve/${id}`,
        method: 'PUT',
      }),

      invalidatesTags: (result, error, id) => [
        { type: tagTypes.Store, id },
        { type: tagTypes.Store, id: 'LIST' },
      ],
    }),

    suspendStore: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/stores/suspend/${id}`,
        method: 'PUT',
      }),

      invalidatesTags: (result, error, id) => [
        { type: tagTypes.Store, id },
        { type: tagTypes.Store, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllStoresQuery,
  useGetStoreByIdQuery,
  useApproveStoreMutation,
  useSuspendStoreMutation,
} = storeApi;
