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
      name: "About",
      description: "information about this website and it's author.",
      href: "./experiments/launch",
    },
    {
      name: "Launch",
      description:
        "A modified version of the svelte kit example that is more type safe.",
      href: "./experiments/launch",
    },
  ];
</script>

<h2>Experiments</h2>
<ul>
  {#each experiments as experiment}
    <li>
      <a href={experiment.href}>
        <h3>{experiment.name}</h3>
        <p>{experiment.description}</p>
      </a>
    </li>
  {/each}
</ul>
