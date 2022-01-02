<script context="module" lang="ts">
  export const prerender = true;

  import { metaForSlug } from "./index.svelte";
  export const meta = metaForSlug("template");
</script>

<h2>{meta.title}</h2>
<p>This is a template that can be copied, when a new post is desired.</p>
