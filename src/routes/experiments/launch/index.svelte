<script context="module" lang="ts">
  import type { ErrorLoad } from "@sveltejs/kit";
  import { LaunchResponse, unwrap } from "../../../lib/Launch";
  import type { LaunchResponseData } from "../../../lib/Launch";

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

<h2>SpaceX Launches With Types</h2>
<p>
  This is the example <a
    target="_blank"
    rel="noopener"
    href="https://svelte.dev">SvelteKit</a
  >
  application fetching GraphQL data from the public
  <a target="_blank" rel="noopener" href="https://api.spacex.land/graphql"
    >SpaceX API</a
  >, but modified to be more type safe with
  <a target="_blank" rel="noopener" href="https://github.com/gcanti/io-ts"
    >io-ts</a
  >. View source on
  <a
    target="_blank"
    rel="noopener"
    href="https://github.com/henriiik/sveltekit-test/blob/main/src/routes/experiments/launch.svelte"
    >GitHub</a
  >.
</p>
<ul>
  {#each response.data.launchesPast as launch}
    <li>
      <a target="_blank" rel="noopener" href={launch.links.video_link}>
        <h3>{launch.mission_name}</h3>
        <p>{new Date(launch.launch_date_local).toLocaleString()}</p>
      </a>
    </li>
  {/each}
</ul>
