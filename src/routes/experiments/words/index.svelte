<script context="module" lang="ts">
  export const prerender = true;

  import { postUrl, type Meta } from "../../../lib/words";

  const metaBySlug: { [slug: string]: Meta } = {
    first_post: {
      published: new Date("2021-12-31T09:50:00.000Z"),
      title: "First post!",
    },
    why_would_you_write_a_blog_with_svelte: {
      published: new Date("2021-12-31T10:39:00.000Z"),
      title: "Why would you write a blog with Svelte?",
    },
    pulumi_automation_the_first: {
      published: new Date("2022-01-01T00:00:00.000Z"),
      title: "Trying to try out the Pulumi Automation API",
    },
    template: {
      published: new Date("2022-01-01T00:00:00.000Z"),
      title: "Why would you look at a template?",
    },
  };

  export function metaForSlug(slug: string): Meta {
    console.log("slug", slug);
    return metaBySlug[slug];
  }

  export const posts = Object.entries(metaBySlug);
  posts.sort((a, b) => b[1].published.getTime() - a[1].published.getTime());
</script>

<h2>Blog</h2>
<ul>
  {#each posts as [slug, meta]}
    <li>
      <a class="card-link" href={postUrl(slug)}>
        <h3>{meta.title}</h3>
        <p>{meta.published.toLocaleString()}</p>
      </a>
    </li>
  {/each}
</ul>
