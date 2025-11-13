import { baseApi, tagTypes } from '../api/baseApi';

interface UploadResult {
  url: string;
  filePath: string;
  createdAt: number;
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImages: builder.mutation<
      UploadResult[],
      { files: File[]; folder?: string }
    >({
      query: ({ files }) => {
        const formData = new FormData();

        files.forEach((file) => {
          formData.append('file', file);
        });

        return {
          url: '/upload/images',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [tagTypes.Account, tagTypes.SystemCategory],
    }),

    deleteFile: builder.mutation<{ message: string }, { filePath: string }>({
      query: ({ filePath }) => ({
        url: `/upload/delete-file`,
        method: 'DELETE',
        body: { filePath },
      }),
    }),
  }),
});

export const { useUploadImagesMutation, useDeleteFileMutation } = uploadApi;
