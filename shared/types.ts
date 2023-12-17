export type Topic = {
  name: string;
  slug: string;
  createdAt: Date;
};

export type Template = {
  id: string;
  name: string;
  slug: string;
  duration: number;
  topicId: string | undefined;
  createdAt: Date;
};

export type Timer = {
  id: string;
  name: string;
  duration: number;
  topicId: string | undefined;
  templateId: string | undefined;
};

export enum TimerStatus {
  Started = "started",
  Paused = "paused",
  Resumed = "resumed",
  Completed = "completed",
  ManualCompleted = "manual-completed",
}

export type Log = {
  id: string;
  timerId: string;
  timerStatus: TimerStatus;
  createdAt: Date;
};
