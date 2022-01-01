<script context="module" lang="ts">
  export const prerender = true;
</script>

<script lang="ts">
  export let experiments = [
    {
      name: "Blog",
      description: "A blog written in svelte.",
      href: "./experiments/blog",
    },
    {
      name: "Launch",
      description:
        "A modified version of the svelte kit example that is more type safe.",
      href: "./experiments/launch",
    },
  ];
</script>

<h1>Experiments</h1>
<ul>
  {#each experiments as experiment}
    <li>
      <a class="card-link" href={experiment.href}>
        <h2>{experiment.name}</h2>
        <p>{experiment.description}</p>
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
