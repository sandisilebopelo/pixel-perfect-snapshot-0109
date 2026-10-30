import { useSyncExternalStore } from "react";

export type Priority = "high" | "medium" | "low";
export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // yyyy-mm-dd or ""
  duration: number; // minutes
  importance: Priority;
  completed: boolean;
  createdAt: number;
}
export interface SavedEmail {
  id: string;
  recipient: string;
  subject: string;
  tone: string;
  content: string;
  createdAt: number;
}
export interface SavedSummary {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}
export interface SavedPlan {
  id: string;
  mode: string;
  content: string;
  createdAt: number;
}
export interface Activity {
  id: string;
  type: "email" | "summary" | "plan" | "task";
  text: string;
  createdAt: number;
}
export interface AppState {
  name: string;
  theme: "light" | "dark";
  tasks: Task[];
  emails: SavedEmail[];
  summaries: SavedSummary[];
  plans: SavedPlan[];
  activity: Activity[];
}

const KEY = "flowdesk-state-v1";
const initial: AppState = {
  name: "",
  theme: "light",
  tasks: [],
  emails: [],
  summaries: [],
  plans: [],
  activity: [],
};

let state: AppState = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

export function setState(fn: (s: AppState) => AppState) {
  load();
  state = fn(state);
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      // notify once after hydration so stored data shows up
      queueMicrotask(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return state;
    },
    () => initial,
  );
}

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function logActivity(type: Activity["type"], text: string) {
  setState((s) => ({
    ...s,
    activity: [{ id: uid(), type, text, createdAt: Date.now() }, ...s.activity].slice(0, 100),
  }));
}

export function todayStr() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function taskStatus(t: Task): "done" | "overdue" | "urgent" | "normal" {
  if (t.completed) return "done";
  if (!t.deadline) return "normal";
  const today = todayStr();
  if (t.deadline < today) return "overdue";
  const diff = (new Date(t.deadline).getTime() - new Date(today).getTime()) / 86400000;
  return diff <= 2 ? "urgent" : "normal";
}

/** Score: higher = do first. Urgency (deadline) + importance. */
export function priorityScore(t: Task): number {
  const imp = { high: 30, medium: 15, low: 0 }[t.importance];
  if (!t.deadline) return imp;
  const days = (new Date(t.deadline).getTime() - new Date(todayStr()).getTime()) / 86400000;
  const urgency = days < 0 ? 60 : Math.max(0, 40 - days * 5);
  return imp + urgency;
}

export function sortByPriority(tasks: Task[]) {
  return [...tasks].sort((a, b) => priorityScore(b) - priorityScore(a));
}
