export type Topic = {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
};

export type Template = {
  id: string;
  name: string;
  duration: number;
  topicId: string | undefined;
  createdAt: number;
};

export type Timer = {
  id: string;
  name: string;
  duration: number;
  topicId: string | undefined;
  templateId: string | undefined;
  createdAt: number;
};

// type TimerWithStatus = Timer & {
//   status: TimerStatus | null;
// };

export interface TimerWithLogs extends Timer {
  logs: Log[];
  latestLog: Log;
}

export enum TimerStatus {
  Started = "started",
  Paused = "paused",
  Resumed = "resumed",
  Completed = "completed",
  ManualCompleted = "manual-completed",
  // Unknown = "unknown",
}

export type Log = {
  id: string;
  timerId: string;
  timerStatus: TimerStatus;
  createdAt: number;
};
