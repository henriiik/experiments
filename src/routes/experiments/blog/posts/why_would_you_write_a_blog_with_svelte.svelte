<script context="module" lang="ts">
  export const prerender = true;

  import type { BlogPost } from "../../../../lib/BlogPost";

  export const meta: BlogPost = {
    published: new Date("2021-12-31T10:39:00.000Z"),
    title: "Why would you write a blog with Svelte?",
    slug: "why_would_you_write_a_blog_with_svelte",
  };
</script>

<h1>{meta.title}</h1>
<p>I guess the first question should be why write a blog at all?</p>
<p>
  I want to practice writing my thoughts down. It is easy to think your thoughts
  are coherent. But untill you get them out either through talking or writing,
  they probably arn't. Being more deliberate in my reflections on things i read
  or watch is also something i wish to do.
</p>
<p>Alright, why Svelte then?</p>
<p>
  Several reasons. For one, trying out the new "compiler instead of runtime
  framework" thing. Basically it svelte could be seen as a static stite
  generator but with more power and less convenience.
</p>
<p>I guess that is moslty one reason, the other reason is it seemed fun.</p>
<p>
  An advantage that is not uniqe to svelte, but rather any format where you can
  write in your local text editor is that you can use all the editor shortcurts
  you know, unlike if you are editing in some web-based UI.
</p>
