<script context="module" lang="ts">
  export const prerender = true;

  import { postUrl, type BlogPost } from "../../../lib/BlogPost";
  import * as a from "./posts/first_post.svelte";
  import * as b from "./posts/why_would_you_write_a_blog_with_svelte.svelte";
  import * as c from "./posts/pulumi_automation_the_first.svelte";

  export const posts: BlogPost[] = [a.meta, b.meta, c.meta];

  posts.sort((a, b) => b.published.getTime() - a.published.getTime());
</script>

<h1>Blog</h1>
<ul>
  {#each posts as post}
    <li>
      <a class="card-link" href={postUrl(post)}>
        <h2>{post.title}</h2>
        <p>{post.published.toLocaleString()}</p>
      </a>
    </li>
  {/each}
</ul>

<style>
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
