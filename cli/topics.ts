import { slug } from "slug";
import { Topic } from "../shared/types.ts";

export function newTopic(name: string): Topic {
  return {
    name: name,
    slug: slug(name),
    createdAt: new Date(),
  };
}
