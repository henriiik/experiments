<script context="module" lang="ts">
  import type { ErrorLoad } from "@sveltejs/kit";
  import type { BlogPost } from "./list";

  export const load: ErrorLoad<{}, { props: { posts: BlogPost[] } }> = async ({
    fetch,
  }) => {
    let props = await (await fetch("/experiments/blog/list")).json();
    return { props };
  };
</script>

<script lang="ts">
  export let posts: BlogPost[];
</script>

<h1>Blog</h1>
<ul>
  {#each posts as post}
    <li>
      <a class="card-link" href={`./blog/posts/${post.path}`}>
        <h2>{post.name}</h2>
        <p>{post.date}</p>
      </a>
    </li>
  {/each}
</ul>
<footer>
  <p>
    Created with <a
      class="link"
      target="_blank"
      rel="noopener"
      href="https://svelte.dev">SvelteKit</a
    >
    and deployed with
    <a class="link" target="_blank" rel="noopener" href="https://vercel.com"
      >▲ Vercel</a
    >.
  </p>
</footer>

<style>
  :global(body) {
    font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console,
      monospace;
    background-color: #fafafa;
    max-width: 650px;
    margin: 32px auto;
    padding: 0 16px;
  }
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
  p {
    color: #666;
    font-size: 14px;
    line-height: 1.75;
  }
  a {
    color: #0070f3;
    text-decoration: none;
  }
  .card-link {
    padding: 8px 24px;
    display: block;
  }
  .link {
    transition: 0.15s text-decoration ease-in-out;
    color: #0761d1;
  }
  .link:hover {
    text-decoration: underline;
  }
</style>
