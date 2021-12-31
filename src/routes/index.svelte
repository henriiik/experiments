<script context="module" lang="ts">
  import type { ErrorLoad } from "@sveltejs/kit";
  import { LaunchResponse, unwrap } from "../lib/Launch";
  import type { LaunchData } from "../lib/Launch";

  export const load: ErrorLoad<{}, { props: { launches: LaunchData[] } }> =
    async (props) => {
      let { fetch } = props;
      const res = await fetch("https://api.spacex.land/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `{
            launchesPast(limit: 10) {
                mission_name
                launch_date_local
                links {
                    video_link
                }
            }
        }`,
        }),
      });

      if (res.ok) {
        const omg = await res.json().then(LaunchResponse.decode).then(unwrap);
        return { props: { launches: omg.data.launchesPast } };
      }

      return {
        status: res.status,
        error: new Error(`Error fetching GraphQL data`),
      };
    };
</script>

<script lang="ts">
  export let launches: LaunchData[];
</script>

<h1>SpaceX Launches</h1>
<p>
  This is an example <a
    class="link"
    target="_blank"
    rel="noopener"
    href="https://svelte.dev">SvelteKit</a
  >
  application fetching GraphQL data from the public
  <a
    class="link"
    target="_blank"
    rel="noopener"
    href="https://api.spacex.land/graphql">SpaceX API</a
  >. View source on
  <a
    class="link"
    target="_blank"
    rel="noopener"
    href="https://github.com/leerob/sveltekit-graphql">GitHub</a
  >.
</p>
<ul>
  {#each launches as launch}
    <li>
      <a
        class="card-link"
        target="_blank"
        rel="noopener"
        href={launch.links.video_link}
      >
        <!-- href={"launch.links.video_link"} -->
        <h2>{launch.mission_name}</h2>
        <p>{new Date(launch.launch_date_local).toLocaleString()}</p>
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
