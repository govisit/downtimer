import { slug } from "slug";
import { Template } from "../shared/types.ts";
import { generateId } from "./db.ts";

export function newTemplate(
  name: string,
  duration: number,
  topicId: string | undefined,
): Template {
  return {
    id: generateId(),
    name: name,
    slug: slug(name),
    duration: duration,
    topicId: topicId,
  };
}
