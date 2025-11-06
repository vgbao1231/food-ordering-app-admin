import { baseApi, tagTypes } from '../api/baseApi';

export const systemCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSystemCategories: builder.query<any, void>({
      query: () => '/system-category',
      providesTags: (result) => {
        const category = result?.data || [];
        if (Array.isArray(category) && category.length > 0) {
          return [
            { type: tagTypes.SystemCategory, id: 'LIST' },
            ...category.map((cat) => ({
              type: tagTypes.SystemCategory,
              id: cat._id,
            })),
          ];
        }
        return [{ type: tagTypes.SystemCategory, id: 'LIST' }];
      },
    }),
    getSystemCategoriesByStoreId: builder.query<any, string>({
      query: (storeId) => `/system-category/store/${storeId}`,
    }),

    getSystemCategoryById: builder.query<any, string>({
      query: (id) => `/system-category/${id}`,
      providesTags: (result, error, id) => [
        { type: tagTypes.SystemCategory, id },
      ],
    }),

    createSystemCategory: builder.mutation<any, any>({
      query: (newCategoryData) => ({
        url: `/system-category`,
        method: 'POST',
        body: newCategoryData,
      }),
      invalidatesTags: [{ type: tagTypes.SystemCategory, id: 'LIST' }],
    }),

    updateSystemCategory: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/system-category/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: tagTypes.SystemCategory, id },
        { type: tagTypes.SystemCategory, id: 'LIST' },
      ],
    }),

    deleteSystemCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/system-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: tagTypes.SystemCategory, id },
        { type: tagTypes.SystemCategory, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllSystemCategoriesQuery,
  useGetSystemCategoriesByStoreIdQuery,
  useGetSystemCategoryByIdQuery,
  useCreateSystemCategoryMutation,
  useUpdateSystemCategoryMutation,
  useDeleteSystemCategoryMutation,
} = systemCategoryApi;
