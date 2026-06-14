"use client"

import * as React from "react"
import { Layers, CheckCircle2, Circle, HelpCircle } from "lucide-react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-full lg:grid lg:grid-cols-2 bg-background overflow-hidden select-none">

      <div className="hidden lg:flex h-full flex-col justify-between p-12 bg-zinc-50 dark:bg-zinc-950/40 border-r border-border/60 overflow-hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black shadow-sm">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            TaskDock
          </span>
        </div>

        <div className="my-auto max-w-sm mx-auto w-full space-y-8">
          <div className="space-y-2.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              All your tasks. <br />
              One quiet, focused space.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-normal">
              Organize projects, manage team workloads, and track timelines on a platform designed to clear the clutter.
            </p>
          </div>

          <div className="border border-border/80 bg-card/50 dark:bg-zinc-900/10 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-xs font-medium text-foreground">Design Sprint</span>
              <div className="flex -space-x-1">
                <span className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-card flex items-center justify-center text-[8px] font-medium text-muted-foreground">JD</span>
                <span className="h-5 w-5 rounded-full bg-zinc-300 dark:bg-zinc-700 border border-card flex items-center justify-center text-[8px] font-medium text-muted-foreground">AS</span>
              </div>
            </div>

            <div className="space-y-2.5">              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="text-xs text-muted-foreground font-normal line-through decoration-muted-foreground/40">
                    Draft initial interface design
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
                  Done
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2.5">
                  <span className="h-4 w-4 rounded-full border border-zinc-400 dark:border-zinc-500 flex items-center justify-center shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  </span>
                  <span className="text-xs text-foreground font-normal">
                    Refine auth page styling & layout
                  </span>
                </div>
                <span className="text-[10px] font-medium text-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card/60 border border-border/30 opacity-70">
                <div className="flex items-center gap-2.5">
                  <Circle className="h-4 w-4 text-zinc-350 dark:text-zinc-650 shrink-0" />
                  <span className="text-xs text-muted-foreground font-normal">
                    Conduct accessibility review
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded-md">
                  Backlog
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Task completions</span>
                <span>2 of 3 tasks</span>
              </div>
              <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-500 dark:bg-zinc-400 rounded-full" style={{ width: '66.6%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-4 shrink-0">
          <span className="flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" />
            Support and documentation
          </span>
          <span>© 2026 TaskDock</span>
        </div>
      </div>

      <div className="relative h-full flex flex-col justify-center items-center p-6 bg-background overflow-hidden">
        <div className="w-full max-w-md flex justify-center overflow-y-auto py-4 max-h-[calc(100vh-2rem)] no-scrollbar">
          <div className="w-full flex justify-center animate-in fade-in duration-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
