<script context="module" lang="ts">
  export const prerender = true;

  import type { BlogPost } from "../../../../lib/BlogPost";

  export const meta: BlogPost = {
    published: new Date("2022-01-01T00:00:00.000Z"),
    title: "Why would you look at a template?",
    slug: "template",
  };
</script>

<h1>{meta.title}</h1>
<p>This is a template that can be copied, when a new post is desired.</p>
