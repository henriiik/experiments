<script context="module" lang="ts">
  import type { BlogPost } from "../../../lib/BlogPost";
  import * as a from "./posts/first_post.svelte";
  import * as b from "./posts/why_would_you_write_a_blog_with_svelte.svelte";

  export const posts: BlogPost[] = [a.meta, b.meta];

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
</script>

<h1>Blog</h1>
<ul>
  {#each posts as post}
    <li>
      <a class="card-link" href={`./blog/posts/${post.path}`}>
        <h2>{post.name}</h2>
        <p>{post.date.toLocaleString()}</p>
      </a>
    </li>
  {/each}
</ul>

<style>
  h1 {
    letter-spacing: -0.025em;
  }
  h2 {
    font-size: 18px;
  }
  ul {
    list-style: none;
    padding: 0;
    margin-top: 32px;
  }
  li {
    border: 1px solid #eaeaea;
    border-radius: 8px;
    margin-bottom: 16px;
    background-color: white;
    transition: 0.15s box-shadow ease-in-out;
  }
  li:hover {
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.12);
  }
  .card-link {
    padding: 8px 24px;
    display: block;
  }
</style>
