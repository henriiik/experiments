import type { RequestHandler } from "@sveltejs/kit";
import { readdir } from "fs";
import { promisify } from "util";
const readdir2 = promisify(readdir);

export type BlogPost = { path: string; name: string; date: string };

export const get: RequestHandler = async ({ params }) => {
  let posts: BlogPost[] = [];

  const dir = await readdir2("./src/routes/experiments/blog/posts");

  for (const entry of dir) {
    const path = entry.replace(/\.svelte.*/, "");
    let split = path.replace(/_/g, " ").split("|");
    posts.push({ path, name: split[1], date: split[0] });
  }

  return { body: { posts } };
};
