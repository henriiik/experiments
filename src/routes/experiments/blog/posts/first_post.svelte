<script context="module" lang="ts">
  export const prerender = true;

  import type { BlogPost } from "../../../../lib/BlogPost";

  export const meta: BlogPost = {
    published: new Date("2021-12-31T09:50:00.000Z"),
    title: "First post!",
    slug: "first_post",
  };
</script>

<h2>{meta.title}</h2>
<p>This is the first post.</p>
<p>It's good to have at least two posts if you want to make a list.</p>
