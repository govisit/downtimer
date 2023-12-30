export type Topic = {
  id: string;
  name: string;
  slug: string;
};

export type Template = {
  id: string;
  name: string;
  slug: string;
  duration: number;
  topicId: string | undefined;
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
};
