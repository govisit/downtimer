export type Topic = {
  name: string;
  slug: string;
  createdAt: Date;
};

export type Template = {
  name: string;
  slug: string;
  duration: number;
  topic: string | undefined;
  createdAt: Date;
};
