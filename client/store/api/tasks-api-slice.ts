import { apiSlice } from "./api-slice"
import type {
  ApiResponse,
  PaginatedResponse,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/types/api.types"

export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET TASKS (PAGINATED & FILTERED)
    getTasks: builder.query<
      ApiResponse<PaginatedResponse<Task>>,
      {
        page: number
        pageSize: number
        search?: string
        status?: string
        sortBy?: string
        sortOrder?: string
      }
    >({
      query: ({ page, pageSize, search, status, sortBy, sortOrder }) => {
        const params: Record<string, string | number> = {
          page,
          size: pageSize,
        }
        if (search) params.search = search
        if (status && status !== "all") params.status = status
        if (sortBy) params.sortBy = sortBy
        if (sortOrder) params.sortOrder = sortOrder

        return {
          url: "tasks",
          method: "GET",
          params,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.result.data.map(({ id }) => ({ type: "Tasks" as const, id })),
              { type: "Tasks", id: "LIST" },
            ]
          : [{ type: "Tasks", id: "LIST" }],
    }),

    // GET TASK BY ID
    getTaskById: builder.query<ApiResponse<Task>, number>({
      query: (id) => ({
        url: `tasks/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Tasks", id }],
    }),

    // CREATE TASK
    createTask: builder.mutation<ApiResponse<Task>, CreateTaskRequest>({
      query: (body) => ({
        url: "tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    // UPDATE TASK
    updateTask: builder.mutation<
      ApiResponse<Task>,
      { id: number; body: UpdateTaskRequest }
    >({
      query: ({ id, body }) => ({
        url: `tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tasks", id: "LIST" },
        { type: "Tasks", id },
      ],
    }),

    // DELETE TASK
    deleteTask: builder.mutation<ApiResponse<Record<string, never>>, number>({
      query: (id) => ({
        url: `tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Tasks", id: "LIST" },
        { type: "Tasks", id },
      ],
    }),

    // GET TASKS STATS
    getTasksStats: builder.query<
      ApiResponse<{ all: number; todo: number; in_progress: number; completed: number }>,
      void
    >({
      query: () => ({
        url: "tasks/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Tasks", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksStatsQuery,
} = tasksApi
