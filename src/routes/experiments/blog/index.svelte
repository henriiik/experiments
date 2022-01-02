<script context="module" lang="ts">
  export const prerender = true;

  import { postUrl, type BlogPost } from "../../../lib/BlogPost";
  import * as a from "./posts/first_post.svelte";
  import * as b from "./posts/why_would_you_write_a_blog_with_svelte.svelte";
  import * as c from "./posts/pulumi_automation_the_first.svelte";

  export const posts: BlogPost[] = [a.meta, b.meta, c.meta];

  posts.sort((a, b) => b.published.getTime() - a.published.getTime());
</script>

<h2>Blog</h2>
<ul>
  {#each posts as post}
    <li>
      <a class="card-link" href={postUrl(post)}>
        <h3>{post.title}</h3>
        <p>{post.published.toLocaleString()}</p>
      </a>
    </li>
  {/each}
</ul>
