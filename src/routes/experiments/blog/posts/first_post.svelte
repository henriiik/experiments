<script context="module" lang="ts">
  export const prerender = true;

  import type { BlogPost } from "../../../../lib/BlogPost";

  export const meta: BlogPost = {
    date: new Date("2021-12-31T09:50:00.000Z"),
    name: "First post!",
    path: "first_post",
  };
  export function wat() {}
</script>

<h1>{meta.name}</h1>
<p>This is the first post.</p>
<p>It's good to have at least two posts if you want to make a list.</p>
