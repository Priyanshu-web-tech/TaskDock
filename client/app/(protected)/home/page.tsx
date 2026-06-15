"use client"

import * as React from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ListTodo,
  CheckSquare,
  Filter,
  ArrowUpDown,
  Circle,
  X,
  Eye,
} from "lucide-react"

import {
  useGetTasksQuery,
  useGetTasksStatsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/store/api/tasks-api-slice"
import usePaginatedQuery from "@/hooks/use-paginated-query"
import { useAppSelector } from "@/store/hook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { DatePicker } from "@/components/date-picker"
import Pagination from "@/components/pagination"
import TaskDetailModal from "@/components/task-detail-modal"
import {
  taskTitleValidation,
  taskDescriptionValidation,
  taskStatusValidation,
  taskPriorityValidation,
  taskDueDateValidation,
} from "@/utils/validations"
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/types/api.types"
import {
  PAGE_SIZE,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/constants/constants"

const formatStatusLabel = (status: string) => STATUS_LABELS[status] ?? status
const formatPriorityLabel = (priority: string) =>
  PRIORITY_LABELS[priority] ?? priority

export default function Page() {
  const { firstName } = useAppSelector((state) => state.userData)

  const [searchTerm, setSearchTerm] = React.useState("")
  const [filters, setFilters] = React.useState({
    search: "",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "DESC" as "ASC" | "DESC",
  })

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }))
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const {
    items: tasks,
    total,
    totalPages,
    page,
    setPage,
    isLoading,
  } = usePaginatedQuery(useGetTasksQuery, filters, PAGE_SIZE)

  const { data: statsData } = useGetTasksStatsQuery()
  const stats = statsData?.result ?? {
    all: 0,
    todo: 0,
    in_progress: 0,
    completed: 0,
  }

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation()

  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [deletingTaskId, setDeletingTaskId] = React.useState<number | null>(
    null
  )
  const [detailTaskId, setDetailTaskId] = React.useState<number | null>(null)

  const handleToggleStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "completed" ? "todo" : "completed"
      const res = await updateTask({
        id: task.id,
        body: { status: newStatus },
      }).unwrap()
      if (res.success) {
        toast.success(
          `Task marked as ${newStatus === "completed" ? "completed" : "active"}`
        )
      } else {
        toast.error(res.message || "Failed to update task")
      }
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update status"
      toast.error(msg)
    }
  }

  const createFormik = useFormik<CreateTaskRequest>({
    initialValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    },
    validationSchema: Yup.object({
      title: taskTitleValidation,
      description: taskDescriptionValidation,
      status: taskStatusValidation,
      priority: taskPriorityValidation,
      dueDate: taskDueDateValidation,
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          ...values,
          dueDate: values.dueDate
            ? new Date(values.dueDate).toISOString()
            : null,
          description: values.description || null,
        }
        const res = await createTask(payload).unwrap()
        if (res.success) {
          toast.success("Task created successfully")
          resetForm()
          setIsCreateOpen(false)
        } else {
          toast.error(res.message || "Failed to create task")
        }
      } catch (err: unknown) {
        const msg =
          (err as { data?: { message?: string } })?.data?.message ||
          "Failed to create task"
        toast.error(msg)
      }
    },
  })

  // Edit Task Formik
  const editFormik = useFormik<UpdateTaskRequest>({
    enableReinitialize: true,
    initialValues: {
      title: editingTask?.title || "",
      description: editingTask?.description || "",
      status: editingTask?.status || "todo",
      priority: editingTask?.priority || "medium",
      dueDate: editingTask?.dueDate
        ? new Date(editingTask.dueDate).toISOString().split("T")[0]
        : "",
    },
    validationSchema: Yup.object({
      title: taskTitleValidation,
      description: taskDescriptionValidation,
      status: taskStatusValidation,
      priority: taskPriorityValidation,
      dueDate: taskDueDateValidation,
    }),
    onSubmit: async (values) => {
      if (!editingTask) return
      try {
        const payload = {
          ...values,
          dueDate: values.dueDate
            ? new Date(values.dueDate).toISOString()
            : null,
          description: values.description || null,
        }
        const res = await updateTask({
          id: editingTask.id,
          body: payload,
        }).unwrap()
        if (res.success) {
          toast.success("Task updated successfully")
          setEditingTask(null)
        } else {
          toast.error(res.message || "Failed to update task")
        }
      } catch (err: unknown) {
        const msg =
          (err as { data?: { message?: string } })?.data?.message ||
          "Failed to update task"
        toast.error(msg)
      }
    },
  })

  // Delete Task Handler
  const handleDeleteTask = async () => {
    if (!deletingTaskId) return
    try {
      const res = await deleteTask(deletingTaskId).unwrap()
      if (res.success) {
        toast.success("Task deleted successfully")
      } else {
        toast.error(res.message || "Failed to delete task")
      }
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to delete task"
      toast.error(msg)
    } finally {
      setDeletingTaskId(null)
    }
  }

  // Format Helper for Due Date
  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Check if date is overdue
  const isOverdue = (dateStr?: string | null, status?: string) => {
    if (!dateStr || status === "completed") return false
    const d = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return d < today
  }

  const filterPanelContent = (
    <>
      {/* Status Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Filter className="h-3 w-3 text-muted-foreground/60" />
          <span>Status</span>
        </div>
        <div className="flex flex-col gap-1">
          {[
            { value: "all", label: "All Tasks", icon: ListTodo },
            { value: "todo", label: "Todo", icon: Circle },
            { value: "in_progress", label: "In Progress", icon: Clock },
            {
              value: "completed",
              label: "Completed",
              icon: CheckCircle2,
            },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all focus:outline-none ${
                filters.status === value
                  ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-black"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/30" />

      {/* Sort Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />
          <span>Sort By</span>
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, sortBy: value }))
          }
        >
          <SelectTrigger className="h-8 w-full rounded-xl border border-border/60 bg-background px-3 text-xs">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              sortOrder: prev.sortOrder === "ASC" ? "DESC" : "ASC",
            }))
          }
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-xl text-xs"
          title={`Sort ${filters.sortOrder === "ASC" ? "Ascending" : "Descending"}`}
        >
          <ArrowUpDown className="h-3 w-3" />
          <span>
            {filters.sortOrder === "ASC" ? "Ascending" : "Descending"}
          </span>
        </Button>
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      {/* Header and Welcome */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName || "User"}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Here is a clean summary of your current tasks.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-100"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                All Tasks
              </p>
              <h3 className="mt-1 text-xl font-bold text-foreground">
                {stats.all}
              </h3>
            </div>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <ListTodo className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Todo
              </p>
              <h3 className="mt-1 text-xl font-bold text-foreground">
                {stats.todo}
              </h3>
            </div>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-500 dark:bg-zinc-900">
              <Circle className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                In Progress
              </p>
              <h3 className="mt-1 text-xl font-bold text-foreground">
                {stats.in_progress}
              </h3>
            </div>
            <div className="rounded-xl bg-zinc-100 p-2 text-blue-500 dark:bg-zinc-900">
              <Clock className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Completed
              </p>
              <h3 className="mt-1 text-xl font-bold text-foreground">
                {stats.completed}
              </h3>
            </div>
            <div className="rounded-xl bg-zinc-100 p-2 text-emerald-500 dark:bg-zinc-900">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Left Filters + Right Tasks */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* ── Left Column: Filters ── */}
        <Card className="hidden lg:block sticky top-20 h-full border border-border/50 bg-card/40 shadow-sm backdrop-blur-md">
          <CardContent className="space-y-5 p-4">
            {filterPanelContent}
          </CardContent>
        </Card>

        {/* ── Right Column: Search + Tasks + Pagination ── */}
        <div className="flex flex-col">
          {/* Search and Filter Bar */}
          <div className="shrink-0 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 w-full rounded-xl border-border/70 pl-9 pr-8 text-xs focus-visible:ring-primary/10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto max-h-[calc(100vh-22rem)]">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Card
                    key={i}
                    className="animate-pulse border border-border/40 bg-card/30"
                  >
                    <CardHeader className="space-y-2 pb-3">
                      <div className="h-4 w-2/3 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-1/2 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                      <div className="h-3 w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-5/6 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-5 w-12 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                        <div className="h-5 w-12 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <Card className="flex flex-col items-center justify-center border border-dashed border-border/70 bg-card/20 py-12 text-center">
                <div className="mb-3.5 rounded-full bg-zinc-100 p-3.5 text-muted-foreground/60 dark:bg-zinc-900">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  No tasks found
                </h3>
                <p className="mt-1 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                  {filters.search || filters.status !== "all"
                    ? "Try adjusting your search criteria or status filter to find tasks."
                    : "All caught up! Create a new task to organize your workspace."}
                </p>
                {filters.search || filters.status !== "all" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setFilters({
                        search: "",
                        status: "all",
                        sortBy: "createdAt",
                        sortOrder: "DESC",
                      })
                    }}
                    className="mt-4 h-8 rounded-xl text-xs"
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    size="sm"
                    className="mt-4 h-8 rounded-xl text-xs"
                  >
                    Create first task
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {tasks.map((task: Task) => {
                  const overdue = isOverdue(task.dueDate, task.status)
                  const formattedDue = formatDueDate(task.dueDate)
                  const isComp = task.status === "completed"

                  return (
                    <Card
                      key={task.id}
                      onClick={() => setDetailTaskId(task.id)}
                      className={`cursor-pointer relative flex flex-col justify-between border transition-all duration-300 ${
                        isComp
                          ? "border-border/40 bg-zinc-50/40 opacity-75 dark:bg-zinc-900/10"
                          : "border-border/60 bg-card hover:border-border hover:shadow-md"
                      }`}
                    >
                      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                        <div className="flex min-w-0 flex-1 items-start gap-2.5">
                          {/* Interactive Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleStatus(task)
                            }}
                            className={`mt-0.5 shrink-0 transition-colors focus:outline-none ${
                              isComp
                                ? "text-emerald-500"
                                : "text-muted-foreground/40 hover:text-foreground"
                            }`}
                            title={isComp ? "Mark active" : "Mark completed"}
                          >
                            {isComp ? (
                              <CheckCircle2 className="h-4.5 w-4.5 fill-emerald-50 dark:fill-emerald-950/20" />
                            ) : (
                              <Circle className="h-4.5 w-4.5" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <h4
                              className={`truncate text-xs font-semibold tracking-tight text-foreground ${
                                isComp
                                  ? "text-muted-foreground line-through"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="mt-1 line-clamp-2 text-[11px] leading-normal font-normal text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetailTaskId(task.id)
                            }}
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title="View details"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingTask(task)
                            }}
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title="Edit task"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeletingTaskId(task.id)
                            }}
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            title="Delete task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </CardHeader>

                      <CardContent className="mt-auto flex flex-wrap items-center justify-between gap-2 rounded-b-2xl border-t border-border/30 bg-muted/5 p-4 pt-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                              task.status === "completed"
                                ? "border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : task.status === "in_progress"
                                  ? "border-blue-200/50 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400"
                                  : "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                            }`}
                          >
                            {formatStatusLabel(task.status)}
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                              task.priority === "high"
                                ? "border-rose-200/50 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/25 dark:text-rose-400"
                                : task.priority === "medium"
                                  ? "border-amber-200/50 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400"
                                  : "text-zinc-650 border-zinc-200/40 bg-zinc-50 dark:border-zinc-800/40 dark:bg-zinc-900/50 dark:text-zinc-400"
                            }`}
                          >
                            {formatPriorityLabel(task.priority)}
                          </span>
                        </div>

                        {formattedDue && (
                          <span
                            className={`flex items-center gap-1 text-[9px] font-medium ${
                              overdue
                                ? "font-semibold text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            {overdue ? (
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                            ) : (
                              <Calendar className="h-3 w-3 shrink-0" />
                            )}
                            <span>
                              {overdue
                                ? `Overdue: ${formattedDue}`
                                : `Due: ${formattedDue}`}
                            </span>
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {!isLoading && tasks.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-end justify-center bg-zinc-950/40 backdrop-blur-sm duration-200 fade-in sm:items-center dark:bg-zinc-950/60"
          onClick={() => setIsFilterOpen(false)}
        >
          <div
            className="relative w-full max-w-sm animate-in overflow-hidden rounded-t-2xl border border-border/80 bg-card shadow-xl duration-200 slide-in-from-bottom sm:rounded-2xl sm:zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Filters
              </h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">{filterPanelContent}</div>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm duration-200 fade-in dark:bg-zinc-950/60"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-md animate-in overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl duration-200 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Create New Task
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={createFormik.handleSubmit}
              className="space-y-4 p-5"
            >
              <div className="space-y-1">
                <Label
                  htmlFor="create-title"
                  className="text-xs text-muted-foreground"
                >
                  Task Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-title"
                  name="title"
                  placeholder="Task title (e.g. Design Dashboard UI)"
                  value={createFormik.values.title}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  className="h-9 rounded-xl border-border/80 text-xs focus-visible:ring-primary/10"
                />
                {createFormik.touched.title && createFormik.errors.title && (
                  <p className="mt-0.5 text-[10px] font-medium text-destructive">
                    {createFormik.errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="create-description"
                  className="text-xs text-muted-foreground"
                >
                  Description <span className="text-muted-foreground/50">(optional)</span>
                </Label>
                <textarea
                  id="create-description"
                  name="description"
                  placeholder="Provide details of this task..."
                  value={createFormik.values.description || ""}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  className="min-h-[72px] w-full resize-none rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground transition-all outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-primary/10"
                />
                {createFormik.touched.description &&
                  createFormik.errors.description && (
                    <p className="mt-0.5 text-[10px] font-medium text-destructive">
                      {createFormik.errors.description}
                    </p>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="create-status"
                    className="text-xs text-muted-foreground"
                  >
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={createFormik.values.status}
                    onValueChange={(value) =>
                      createFormik.setFieldValue("status", value)
                    }
                  >
                    <SelectTrigger className="h-9 w-full rounded-xl border border-border/85 bg-background px-3 py-1.5 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Todo</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="create-priority"
                    className="text-xs text-muted-foreground"
                  >
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={createFormik.values.priority}
                    onValueChange={(value) =>
                      createFormik.setFieldValue("priority", value)
                    }
                  >
                    <SelectTrigger className="h-9 w-full rounded-xl border border-border/85 bg-background px-3 py-1.5 text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  value={createFormik.values.dueDate || null}
                  onChange={(val) =>
                    createFormik.setFieldValue("dueDate", val ?? "")
                  }
                  onBlur={() => createFormik.setFieldTouched("dueDate", true)}
                  placeholder="Pick a due date"
                  className="h-9 rounded-xl border-border/80 text-xs"
                  minDate={new Date()}
                />
                {createFormik.touched.dueDate &&
                  createFormik.errors.dueDate && (
                    <p className="mt-0.5 text-[10px] font-medium text-destructive">
                      {createFormik.errors.dueDate}
                    </p>
                  )}
              </div>

              <div className="flex justify-end gap-2 border-t border-border/50 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-8 rounded-xl text-xs font-normal"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCreating}
                  className="h-8 rounded-xl text-xs font-medium"
                >
                  {isCreating && (
                    <Spinner className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm duration-200 fade-in dark:bg-zinc-950/60"
          onClick={() => setEditingTask(null)}
        >
          <div
            className="relative w-full max-w-md animate-in overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl duration-200 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Edit Task
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={editFormik.handleSubmit} className="space-y-4 p-5">
              <div className="space-y-1">
                <Label
                  htmlFor="edit-title"
                  className="text-xs text-muted-foreground"
                >
                  Task Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-title"
                  name="title"
                  placeholder="Task title"
                  value={editFormik.values.title}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  className="h-9 rounded-xl border-border/80 text-xs focus-visible:ring-primary/10"
                />
                {editFormik.touched.title && editFormik.errors.title && (
                  <p className="mt-0.5 text-[10px] font-medium text-destructive">
                    {editFormik.errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="edit-description"
                  className="text-xs text-muted-foreground"
                >
                  Description <span className="text-muted-foreground/50">(optional)</span>
                </Label>
                <textarea
                  id="edit-description"
                  name="description"
                  placeholder="Provide details..."
                  value={editFormik.values.description || ""}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  className="min-h-[72px] w-full resize-none rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground transition-all outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-primary/10"
                />
                {editFormik.touched.description &&
                  editFormik.errors.description && (
                    <p className="mt-0.5 text-[10px] font-medium text-destructive">
                      {editFormik.errors.description}
                    </p>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="edit-status"
                    className="text-xs text-muted-foreground"
                  >
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editFormik.values.status}
                    onValueChange={(value) =>
                      editFormik.setFieldValue("status", value)
                    }
                  >
                    <SelectTrigger className="h-9 w-full rounded-xl border border-border/85 bg-background px-3 py-1.5 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Todo</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="edit-priority"
                    className="text-xs text-muted-foreground"
                  >
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editFormik.values.priority}
                    onValueChange={(value) =>
                      editFormik.setFieldValue("priority", value)
                    }
                  >
                    <SelectTrigger className="h-9 w-full rounded-xl border border-border/85 bg-background px-3 py-1.5 text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  value={editFormik.values.dueDate || null}
                  onChange={(val) =>
                    editFormik.setFieldValue("dueDate", val ?? "")
                  }
                  onBlur={() => editFormik.setFieldTouched("dueDate", true)}
                  placeholder="Pick a due date"
                  className="h-9 rounded-xl border-border/80 text-xs"
                  minDate={new Date()}
                />
                {editFormik.touched.dueDate && editFormik.errors.dueDate && (
                  <p className="mt-0.5 text-[10px] font-medium text-destructive">
                    {editFormik.errors.dueDate}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-border/50 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTask(null)}
                  className="h-8 rounded-xl text-xs font-normal"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating}
                  className="h-8 rounded-xl text-xs font-medium"
                >
                  {isUpdating && (
                    <Spinner className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingTaskId !== null && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm duration-200 fade-in dark:bg-zinc-950/60"
          onClick={() => setDeletingTaskId(null)}
        >
          <div
            className="relative w-full max-w-sm animate-in overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl duration-200 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Delete Task
              </h3>
              <p className="mt-1.5 text-xs leading-normal text-muted-foreground">
                Are you sure you want to delete this task? This action is
                permanent and cannot be undone.
              </p>
            </div>
            <div className="flex border-t border-border/50">
              <button
                onClick={() => setDeletingTaskId(null)}
                className="flex-1 border-r border-border/50 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 focus:outline-none"
              >
                {isDeleting && (
                  <Spinner className="h-3 w-3 animate-spin text-destructive" />
                )}
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {detailTaskId !== null && (
        <TaskDetailModal
          taskId={detailTaskId}
          onClose={() => setDetailTaskId(null)}
        />
      )}
    </div>
  )
}
