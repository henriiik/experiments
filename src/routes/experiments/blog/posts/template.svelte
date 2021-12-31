<script context="module" lang="ts">
  export const prerender = true;

  import type { BlogPost } from "../../../../lib/BlogPost";

  export const meta: BlogPost = {
    date: new Date("2022-01-01T00:00:00.000Z"),
    name: "Why would you look at a template?",
    path: "template",
  };
</script>

<h1>{meta.name}</h1>
<p>This is a template that can be copied, when a new post is desired.</p>
