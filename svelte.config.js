import vercel from "@sveltejs/adapter-vercel";
import preprocess from "svelte-preprocess";

export default {
  kit: {
    adapter: vercel(),
    target: "#svelte",
  },
  preprocess: preprocess({ typescript: {} }),
};
