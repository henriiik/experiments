<script context="module" lang="ts">
  export const prerender = true;

  import type { BlogPost } from "../../../../lib/BlogPost";

  export const meta: BlogPost = {
    published: new Date("2022-01-01T00:00:00.000Z"),
    title: "Trying to try out the Pulumi Automation API",
    slug: "pulumi_automation_the_first",
  };
</script>

<h1>{meta.title}</h1>
<p>
  So i wanted to try out <a
    href="https://www.pulumi.com/docs/guides/automation-api/"
    >Pulumis Automation API</a
  > to see what the potential for automating complex deployments, as well as for
  simplifying workflows that involve multuple stacks. This was what actually pushed
  me over the edge to create this website.
</p>
<p>So, after taking a look at the getting started guide, i dove right in.</p>
<p>I creates a small library file with a super simple inline program</p>
<code
  ><pre>{`
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const args: pulumi.automation.InlineProgramArgs = {
  program: async () => {
    let bucket = new aws.s3.Bucket("automation-bucket");
    return { bucketArn: bucket.arn };
  },
  projectName: "dev",
  stackName: "automation-test",
};

export async function up() {
  const stack = await pulumi.automation.LocalWorkspace.createOrSelectStack(
    args
  );
  return { name: stack.name };
}
`.trim()}</pre></code
>
<p>And an endpoint that called the <b>up</b> function</p>
<code
  ><pre>{`
import type { RequestHandler } from "@sveltejs/kit";
import { up } from "../../../lib/pulumi/automation";

export const get: RequestHandler<{}, {}, { name: string }> = async (req) => {
  let body = await up();
  return { body };
};
`.trim()}</pre></code
>
<p>Which I then called with curl</p>
<code
  ><pre>{`
$ curl http://localhost:3000/experiments/pulumi/up
Error: Failed to resolve entry for package "spdx-license-ids". The package may have incorrect main/module/exports specified in its package.json: Failed to resolve entry for package "spdx-license-ids". The package may have incorrect main/module/exports specified in its package.json.
    at packageEntryFailure (/Users/henke/Development/sveltekit-test/node_modules/vite/src/node/plugins/resolve.ts:766:9)
    at resolvePackageEntry (/Users/henke/Development/sveltekit-test/node_modules/vite/src/node/plugins/resolve.ts:761:5)
    at tryNodeResolve (/Users/henke/Development/sveltekit-test/node_modules/vite/src/node/plugins/resolve.ts:539:16)
    at viteResolve (/Users/henke/Development/sveltekit-test/node_modules/vite/src/node/ssr/ssrModuleLoader.ts:218:22)
    at Function.<anonymous> (/Users/henke/Development/sveltekit-test/node_modules/vite/src/node/ssr/ssrModuleLoader.ts:238:16)
    at Function.Module._load (node:internal/modules/cjs/loader:778:27)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/Users/henke/Development/sveltekit-test/node_modules/spdx-expression-parse/scan.js:4:11)
`.trim()}</pre></code
>
<p>It did not work.</p>
<p>
  A quick googling turned up that <a
    href="https://github.com/vitejs/vite/discussions/3892"
    >i was not the first person to hit this.</a
  >
</p>
<p>
  The error message says that the <b>package.json</b> file of the
  <b>spdx-license-ids</b>
  package might not be set up correctly. I did some digging and it turns out that
  the package does not have any js files, it's main entrypoint is a
  <b>index.json</b> file. I took a look at
  <a href="https://docs.npmjs.com/cli/v8/configuring-npm/package-json#main"
    >the <b>package.json</b> spec</a
  >
  and it says that the default value for <b>main</b> is <b>index.js</b>. A quick
  local edit of the <b>node_modules/spdx-license-ids/package.json</b> to add
  <b>main: "index.json"</b> solves the issue, but it appears that the module
  <b>spdx-exceptions</b> has the same problem. Modifying <b>spdx-exceptions</b> in
  the same way gets us where we want to go, and now the endpoint returns the name
  of the stack!
</p>
<code
  ><pre>{`
$ curl http://localhost:3000/experiments/pulumi/up
{"name":"automation-test"}
`.trim()}</pre></code
>
<p>
  <a
    href="https://github.com/henriiik/spdx-license-ids/commit/3150c19020a5e09609b8475456038420baa7537c"
    >So a fork and a quick commit later</a
  >
  (thanks to the
  <a href="https://marketplace.visualstudio.com/items?itemName=GitHub.remotehub"
    >GitHub Repositories extension for VSCode</a
  > I did not even have to manually clone the repo, just "open" it, make the change
  and commit.), I am ready to override the version of the library with my fork.
</p>
<p>
  My Svelte project uses <b>npm</b> as the package manages, because that is what
  the template used. And it seems that just recently
  <a href="https://github.com/npm/cli/releases/tag/v8.3.0"
    >npm released support for the overrides configuration</a
  >. "A piece of cake then" I thought and added some overrides to my
  <b>package.json</b>.
</p>
<code
  ><pre>{`
"overrides": {
  "spdx-license-ids": "git+https://github.com/henriiik/spdx-license-ids.git"
},
`.trim()}</pre></code
>
<p>It did not work.</p>
<code
  ><pre>{`
"dependencies": {
  /// ....
  "spdx-license-ids": "git+https://github.com/henriiik/spdx-license-ids.git"
},
"overrides": {
  "spdx-license-ids": "$spdx-license-ids"
},
`.trim()}</pre></code
>
<p>
  Adding <b>spdx-license-ids</b> as a dependency, and refering to it from
  <b>overrides</b> did work however. It is unclear if this is the intended behvior.
</p>
<p>
  I repeated the process for <b>spdx-exceptions</b> and now i am able to run the
  pulumi automation code to get or create a stack!
</p>
<p>
  Which of course means it's time to start creating PRs to the upstream repos
  with my changes. Said and done, <a
    href="https://github.com/jslicense/spdx-exceptions.json/pull/8"
    >PRs were made to spdx-exceptions</a
  >
  and
  <a href="https://github.com/jslicense/spdx-license-ids/pull/29">
    spdx-license-ids</a
  >.
</p>
<p>
  But within 24h the first one was closed, with the reasoning that the node
  module resolution algorithm falls back to <b>index.json</b> if <b>index.js</b>
  when <b>main</b> is falsy.
  <a href="https://nodejs.org/api/modules.html#all-together"
    >As is clearly stated by the node documentation</a
  >, if you knew to look there.
</p>
<p>
  So I thought maybe I had made a mistake with the configuration, and i took
  another look at the <a href="https://vitejs.dev/config/#resolve-extensions"
    >vite docs</a
  >. But the only thing that looked relevant was the <b>resolve.extensions</b>
  configuration and includes <b>.json</b> by default.
</p>
<p>
  <a href="https://github.com/vitejs/vite/search?q=index.json"
    >A search in the repository for index.json</a
  >
  showed that it only appears in the previously mentioned discussion. Taking a look
  at the stacktrace instead lead me to look at
  <a
    href="https://github.com/vitejs/vite/blob/a49d72358f2d028f62b0e9fcdb096a0e5ddf24c3/packages/vite/src/node/plugins/resolve.ts#L729"
    >vite/src/node/plugins/resolve.ts</a
  >, in which as far as i can tell, the only fallback is <b>index.js</b> and not
  <b>index.json</b>.
</p>
<p>
  So I decided to file a bug in the <b>vite</b> project, since the fix did not
  seem obvious. The experience of submitting the bug was very nice, as they have
  a template that guides the process very well, and a handy link to
  <a href="https://vite.new">vite.new</a> that makes it very easy to create a minimal
  reproduction directly in the browser.
</p>
<p>to be continued..</p>
