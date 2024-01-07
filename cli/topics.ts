import { slug } from "slug";
import { Topic } from "../shared/types.ts";
import { generateId } from "./utils.ts";

export function newTopic(name: string): Topic {
  return {
    id: generateId(),
    name: name,
    slug: slug(name),
  };
}
