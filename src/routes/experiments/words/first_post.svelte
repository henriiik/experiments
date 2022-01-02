<script context="module" lang="ts">
  export const prerender = true;

  import { metaForSlug } from "./index.svelte";
  export const meta = metaForSlug("first_post");
</script>

<h2>{meta.title}</h2>
<p>This is the first post.</p>
<p>It's good to have at least two posts if you want to make a list.</p>
