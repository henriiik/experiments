<script context="module" lang="ts">
  import type { ErrorLoad } from "@sveltejs/kit";
  import { LaunchResponse, unwrap } from "../../lib/Launch";
  import type { LaunchResponseData } from "../../lib/Launch";

  export const load: ErrorLoad<
    {},
    { props: { response: LaunchResponseData } }
  > = async (props) => {
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
      const response = await res
        .json()
        .then(LaunchResponse.decode)
        .then(unwrap);
      return { props: { response } };
    }

    return {
      status: res.status,
      error: new Error(`Error fetching GraphQL data`),
    };
  };
</script>

<script lang="ts">
  export let response: LaunchResponseData;
</script>

<h1>SpaceX Launches With Types</h1>
<p>
  This is the example <a
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
  >, but modified to be more type safe with
  <a
    class="link"
    target="_blank"
    rel="noopener"
    href="https://github.com/gcanti/io-ts">io-ts</a
  >. View source on
  <a
    class="link"
    target="_blank"
    rel="noopener"
    href="https://github.com/henriiik/sveltekit-test/blob/main/src/routes/experiments/launch.svelte"
    >GitHub</a
  >.
</p>
<ul>
  {#each response.data.launchesPast as launch}
    <li>
      <a
        class="card-link"
        target="_blank"
        rel="noopener"
        href={launch.links.video_link}
      >
        <h2>{launch.mission_name}</h2>
        <p>{new Date(launch.launch_date_local).toLocaleString()}</p>
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
  .link {
    transition: 0.15s text-decoration ease-in-out;
    color: #0761d1;
  }
  .link:hover {
    text-decoration: underline;
  }
</style>
