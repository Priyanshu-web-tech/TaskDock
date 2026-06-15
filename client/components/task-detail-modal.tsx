"use client"

import * as React from "react"
import { Calendar, Clock, X, AlertTriangle, CheckCircle2, Circle } from "lucide-react"

import { useGetTaskByIdQuery } from "@/store/api/tasks-api-slice"
import { Spinner } from "@/components/ui/spinner"
import { PRIORITY_LABELS, STATUS_LABELS } from "@/constants/constants"

interface TaskDetailModalProps {
  taskId: number
  onClose: () => void
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—"
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return "—"
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const isOverdue = (dateStr?: string | null, status?: string) => {
  if (!dateStr || status === "completed") return false
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

export default function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { data, isLoading, isError, error } = useGetTaskByIdQuery(taskId)
  const task = data?.result

  return (
    <div
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm duration-200 fade-in dark:bg-zinc-950/60"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg animate-in overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl duration-200 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          <h3 className="text-sm font-semibold text-foreground">Task Details</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError || !task ? (
            <div className="py-8 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
              <p className="mt-2 text-sm text-muted-foreground">
                {(error as { data?: { message?: string } })?.data?.message || "Failed to load task details"}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Title */}
              <div>
                <h2 className="break-words text-base font-bold text-foreground">{task.title}</h2>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Description
                </p>
                {task.description ? (
                  <p className="break-words text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground/50">No description provided</p>
                )}
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Status
                  </p>
                  <div className="flex items-center gap-1.5">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : task.status === "in_progress" ? (
                      <Clock className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-zinc-400" />
                    )}
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        task.status === "completed"
                          ? "border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : task.status === "in_progress"
                            ? "border-blue-200/50 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400"
                            : "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                      }`}
                    >
                      {STATUS_LABELS[task.status] ?? task.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Priority
                  </p>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      task.priority === "high"
                        ? "border-rose-200/50 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/25 dark:text-rose-400"
                        : task.priority === "medium"
                          ? "border-amber-200/50 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400"
                          : "border-zinc-200/40 bg-zinc-50 text-zinc-600 dark:border-zinc-800/40 dark:bg-zinc-900/50 dark:text-zinc-400"
                    }`}
                  >
                    {PRIORITY_LABELS[task.priority] ?? task.priority}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Due Date
                </p>
                <div className="flex items-center gap-1.5 text-sm">
                  {task.dueDate ? (
                    <>
                      {isOverdue(task.dueDate, task.status) ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={
                          isOverdue(task.dueDate, task.status)
                            ? "font-medium text-destructive"
                            : "text-foreground/90"
                        }
                      >
                        {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate, task.status) && " (Overdue)"}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground/60">No due date set</span>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="border-t border-border/30 pt-4">
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Created</span>
                    <p className="mt-0.5">{formatDateTime(task.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Updated</span>
                    <p className="mt-0.5">{formatDateTime(task.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
