<script context="module" lang="ts">
  import type { BlogPost } from "../../../../lib/BlogPost";

  export const meta: BlogPost = {
    date: new Date("2021-12-31T10:39:00.000Z"),
    name: "Why would you write a blog with Svelte?",
    path: "why_would_you_write_a_blog_with_svelte",
  };
</script>

<h1>{meta.name}</h1>
<p>For fun?</p>
