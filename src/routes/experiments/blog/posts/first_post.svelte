<script context="module" lang="ts">
  import type { BlogPost } from "../../../../lib/BlogPost";

  export const meta: BlogPost = {
    date: new Date("2021-12-31T09:50:00.000Z"),
    name: "First post!",
    path: "first_post",
  };
  export function wat() {}
</script>

<h1>{meta.name}</h1>
<p>This is thet first post.</p>
