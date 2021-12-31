import type { RequestHandler } from "@sveltejs/kit";
import { opendir } from "fs";
import { promisify } from "util";
const opendir2 = promisify(opendir);

export type BlogPost = { path: string; name: string; date: string };

export const get: RequestHandler = async ({ params }) => {
  let posts: BlogPost[] = [];

  const dir = await opendir2("./src/routes/experiments/blog/posts");
  for await (const entry of dir) {
    const path = entry.name.replace(/.svelte$/, "");
    let split = path.replace(/_/g, " ").split("|");
    posts.push({ path, name: split[1], date: split[0] });
  }

  return { body: { posts } };
};
