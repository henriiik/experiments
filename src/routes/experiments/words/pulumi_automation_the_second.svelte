<script context="module" lang="ts">
  export const prerender = true;

  import { metaForSlug } from "./index.svelte";
  export const meta = metaForSlug("pulumi_automation_the_second");
</script>

<h2>{meta.title}</h2>
<p>
  So, <a href="../pulumi_automation_the_second"
    >the last time we tried to try out the Pulumi Automation API</a
  >
  it ended with a long
  <a href="https://en.wiktionary.org/wiki/yak_shaving">yak shave</a> around
  getting
  <b>vite</b> to compile Pulumis dependencies. But in the end we were able to
  call
  <code>pulumi.automation.LocalWorkspace.createOrSelectStack</code>
  to get a reference to a new or possibly existing stack. (I did check the pulumi
  website and it was not created.)
</p>
<p>
  Since it's good to be careful, the next step is to see if we can get pulumi to
  do a preview of the stack. So lets update our up function to do that.
</p>
<pre>{`
export async function up() {
  const stack = await pulumi.automation.LocalWorkspace.createOrSelectStack(
    args
  );
  let preview = await stack.preview();
  return { name: stack.name, preview: preview.changeSummary };
}
`.trim()}</pre>
<p>There we go! Not so hard, lets take it for a spin.</p>
<pre>{`
$ curl http://localhost:3000/experiments/pulumi/up
CommandError: code: 255
 stdout: Previewing update (automation-test)

View Live: https://app.pulumi.com/henriiik/dev/automation-test/previews/8f5e9252-8d9c-491b-ba27-ca0e99aae787


 +  pulumi:pulumi:Stack dev-automation-test create
    aws:s3:Bucket automation-bucket  error: unable to discover AWS AccessKeyID and/or SecretAccessKey - see https://pulumi.io/install/aws.html for details on configuration
    aws:s3:Bucket automation-bucket  1 error
 +  pulumi:pulumi:Stack dev-automation-test create

Diagnostics:
  aws:s3:Bucket (automation-bucket):
    error: unable to discover AWS AccessKeyID and/or SecretAccessKey - see https://pulumi.io/install/aws.html for details on configuration



 err?:

    at Object.createCommandError (/Users/henke/Development/experiments/node_modules/@pulumi/automation/errors.ts:73:21)
    at ChildProcess.<anonymous> (/Users/henke/Development/experiments/node_modules/@pulumi/automation/cmd.ts:80:31)
    at ChildProcess.emit (events.js:400:28)
    at ChildProcess.emit (domain.js:475:12)
    at Process.ChildProcess._handle.onexit (internal/child_process.js:282:12)
`.trim()}</pre>
<p>
  We did it! We got some output, and it looks like the library is just calling
  out to the pulumi CLI, which needs to be updated. It seems like the CLI can
  find my pulumi credentials, but not my AWS credentials which is interesting.
  But a lot of <code>UnhandledPromiseRejectionWarning</code> warnings has turned
  up in the console and it looks like pulumi is creating a lot of promises that it
  cant keep (ha!).
</p>
<pre>{`
(node:37966) UnhandledPromiseRejectionWarning: Error: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
  at Object.registerResource (/Users/henke/Development/experiments/node_modules/@pulumi/runtime/resource.ts:294:27)
  at new Resource (/Users/henke/Development/experiments/node_modules/@pulumi/resource.ts:388:13)
  at new CustomResource (/Users/henke/Development/experiments/node_modules/@pulumi/resource.ts:759:9)
  at new Bucket (/Users/henke/Development/experiments/node_modules/@pulumi/s3/bucket.ts:520:9)
  at Object.program [as init] (/src/lib/pulumi/automation.ts:9:18)
  at Stack.<anonymous> (/Users/henke/Development/experiments/node_modules/@pulumi/runtime/stack.ts:82:39)
  at Generator.next (<anonymous>)
  at fulfilled (/Users/henke/Development/experiments/node_modules/@pulumi/pulumi/runtime/stack.js:18:58)
  at processTicksAndRejections (internal/process/task_queues.js:95:5)
(Use \`node --trace-warnings ...\` to show where the warning was created)
(node:37966) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag \`--unhandled-rejections=strict\` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
(node:37966) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
`.trim()}</pre>
<p>
  Adding some error handling to our request handler would allow us to gracefully
  handle if any of our code crashes.
</p>
<pre>{`
import type { OpMap } from "@pulumi/pulumi/automation";
import type { RequestHandler } from "@sveltejs/kit";
import { up } from "../../../lib/pulumi/automation";

export const get: RequestHandler<
  {},
  {},
  { name: string; preview: OpMap } | { error: string }
> = async (req) => {
  try {
    let body = await up();
    return { body };
  } catch (e) {
    return {
      status: 500,
      body: { error: \`\${e}\` },
    };
  }
};
`.trim()}</pre>
<pre>{`
$ curl http://localhost:3000/experiments/pulumi/up
{"error":"CommandError: code: 255\n stdout: Previewing update (automation-test)\n\nView Live: https://app.pulumi.com/henriiik/dev/automation-test/previews/8d03db9e-ffb6-454c-adfb-034b7a279ac9\n\n\n +  pulumi:pulumi:Stack dev-automation-test create \n    aws:s3:Bucket automation-bucket  error: unable to discover AWS AccessKeyID and/or SecretAccessKey - see https://pulumi.io/install/aws.html for details on configuration\n +  pulumi:pulumi:Stack dev-automation-test create \n    aws:s3:Bucket automation-bucket  1 error\n \nDiagnostics:\n  aws:s3:Bucket (automation-bucket):\n    error: unable to discover AWS AccessKeyID and/or SecretAccessKey - see https://pulumi.io/install/aws.html for details on configuration\n \n\n\n err?: \n"}
`.trim()}</pre>
<p>
  Looks like we are getting our json error, there are still a lot of unhandled
  promise rejections in the console, so we will have to try something more.
</p>
<p>
  <a href="https://nodejs.org/api/process.html#event-unhandledrejection"
    >Node has an api to handle unhandled promise rejections</a
  >, let's give it a spin and see how it goes. Copy/pasting from the internet
  like a real pro gives us this snippet:
</p>
<pre>{`
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});
`.trim()}</pre>
<p>That should, at least, give us some different output.</p>
<pre>{`
Unhandled Rejection at: Promise {
  <rejected> <ref *1> Error: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
      at Object.registerResource (/Users/henke/Development/experiments/node_modules/@pulumi/runtime/resource.ts:294:27)
      at new Resource (/Users/henke/Development/experiments/node_modules/@pulumi/resource.ts:388:13)
      at new CustomResource (/Users/henke/Development/experiments/node_modules/@pulumi/resource.ts:759:9)
      at new Bucket (/Users/henke/Development/experiments/node_modules/@pulumi/s3/bucket.ts:520:9)
      at Object.program [as init] (/src/lib/pulumi/automation.ts:9:18)
      at Stack.<anonymous> (/Users/henke/Development/experiments/node_modules/@pulumi/runtime/stack.ts:82:39)
      at Generator.next (<anonymous>)
      at fulfilled (/Users/henke/Development/experiments/node_modules/@pulumi/pulumi/runtime/stack.js:18:58)
      at processTicksAndRejections (internal/process/task_queues.js:95:5) {
    code: 14,
    promise: Promise { <rejected> [Circular *1] }
  }
} reason: <ref *1> Error: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
    at Object.registerResource (/Users/henke/Development/experiments/node_modules/@pulumi/runtime/resource.ts:294:27)
    at new Resource (/Users/henke/Development/experiments/node_modules/@pulumi/resource.ts:388:13)
    at new CustomResource (/Users/henke/Development/experiments/node_modules/@pulumi/resource.ts:759:9)
    at new Bucket (/Users/henke/Development/experiments/node_modules/@pulumi/s3/bucket.ts:520:9)
    at Object.program [as init] (/src/lib/pulumi/automation.ts:9:18)
    at Stack.<anonymous> (/Users/henke/Development/experiments/node_modules/@pulumi/runtime/stack.ts:82:39)
    at Generator.next (<anonymous>)
    at fulfilled (/Users/henke/Development/experiments/node_modules/@pulumi/pulumi/runtime/stack.js:18:58)
    at processTicksAndRejections (internal/process/task_queues.js:95:5) {
  code: 14,
  promise: Promise { <rejected> [Circular *1] }
}`.trim()}</pre>
<p>
  It did! But the output is quite a lot worse than we had before, but we can see
  that type type of the reason parameter is <code>Error</code>, so lets see if
  we can do something with that.
</p>
<pre>{`
process.on("unhandledRejection", (reason, promise) => {
  if (
    reason instanceof Error &&
    reason.stack?.includes("node_modules/@pulumi")
  ) {
    console.warn("Unhandled Pulumi Rejection:", reason.message);
  } else {
    console.warn("Unhandled Rejection at:", promise, "reason:", reason);
  }
});
`.trim()}</pre>
<p>
  Ah, now we check if the unhandled promise rejection is comming from the any of
  the <code>@pulumi/*</code> packages and in that case we only print the message,
  since at this time we don't want to take action on the stacktrace.
</p>
<pre>{`
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: Program run without the Pulumi engine available; re-run using the \`pulumi\` CLI
Unhandled Pulumi Rejection: Program run without the Pulumi engine available; re-run using the \`pulumi\` CLI
Unhandled Rejection at: Promise {
  <rejected> [Error: ENOENT: no such file or directory, stat '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-6sGqIU/eventlog.txt'] {
    errno: -2,
    code: 'ENOENT',
    syscall: 'stat',
    path: '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-6sGqIU/eventlog.txt'
  }
} reason: [Error: ENOENT: no such file or directory, stat '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-6sGqIU/eventlog.txt'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'stat',
  path: '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-6sGqIU/eventlog.txt'
}`.trim()}</pre>
<p>
  Thats a lot of rejected promises. A lot of them are the same, but there a few
  interesting ones at the end! One of them says <b
    >"Program run without the Pulumi engine available; re-run using the `pulumi`
    CLI"</b
  > which does not mean much to me but it reminded me of the getting started guide
  on the pulumi website. In the guide they added some pulumi aws plugin in the code
  as well, not just as a dependency, perhaps that is what is causing all the errors.
  Or at least why it can't find my AWS credentials.
</p>
<pre>{`
export async function up() {
  console.log("getting stack..");
  const stack = await pulumi.automation.LocalWorkspace.createOrSelectStack(
    args
  );

  console.log("installing aws plugin..");
  await stack.workspace.installPlugin("aws", "v4.0.0");

  console.log("setting aws region..");
  await stack.setConfig("aws:region", { value: "eu-north-1" });

  console.log("previewing stack..");
  let preview = await stack.preview();

  console.log("done!");
  return { name: stack.name, preview: preview.changeSummary };
}
`.trim()}</pre>
<p>
  I added the plugin and config from the getting started guide as well as some
  logging, since the call does take a long time and it's nice to see what is
  going on.
</p>
<pre>{`
getting stack..
installing aws plugin..
setting aws region..
previewing stack..
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating

*** a lot more ***

Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: failed to register new resource automation-bucket [aws:s3/bucket:Bucket]: Resource monitor is terminating
Unhandled Pulumi Rejection: Program run without the Pulumi engine available; re-run using the \`pulumi\` CLI
Unhandled Pulumi Rejection: Program run without the Pulumi engine available; re-run using the \`pulumi\` CLI
Unhandled Pulumi Rejection: Program run without the Pulumi engine available; re-run using the \`pulumi\` CLI
Unhandled Pulumi Rejection: Program run without the Pulumi engine available; re-run using the \`pulumi\` CLI
Unhandled Pulumi Rejection: Program run without the Pulumi engine available; re-run using the \`pulumi\` CLI
Unhandled Pulumi Rejection: Program run without the Pulumi engine available; re-run using the \`pulumi\` CLI
Unhandled Rejection at: Promise {
  <rejected> [Error: ENOENT: no such file or directory, stat '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'] {
    errno: -2,
    code: 'ENOENT',
    syscall: 'stat',
    path: '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'
  }
} reason: [Error: ENOENT: no such file or directory, stat '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'stat',
  path: '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'
}
Unhandled Rejection at: Promise {
  <rejected> [Error: ENOENT: no such file or directory, stat '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'] {
    errno: -2,
    code: 'ENOENT',
    syscall: 'stat',
    path: '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'
  }
} reason: [Error: ENOENT: no such file or directory, stat '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'stat',
  path: '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'
}
Unhandled Rejection at: Promise {
  <rejected> [Error: ENOENT: no such file or directory, stat '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'] {
    errno: -2,
    code: 'ENOENT',
    syscall: 'stat',
    path: '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'
  }
} reason: [Error: ENOENT: no such file or directory, stat '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'stat',
  path: '/var/folders/57/5gksgsln7w7260qsx4kxry380000gn/T/automation-logs-preview-Hjh6P0/eventlog.txt'
}
`.trim()}</pre>
<p>
  The credentials error was not fixed, and there seems to be three times as many
  rejected promises.
</p>
<p>
  Thats a lot of errors but i don't think we can get rid of them without some
  pretty gnarly changes in pulumi so for now how about we focus on get aws
  credentials problem. Lets see what the aws cli has to say about it.
</p>
<pre>{`
$ aws sts get-caller-identity
Unable to locate credentials. You can configure credentials by running "aws configure".
`.trim()}</pre>
<p>
  Huh. I was pretty sure my environment was set up, but it is not. I realise now
  that i set up <a href="https://github.com/99designs/aws-vault">aws-vault</a> the
  other day, which is of course great if you remember to use it. It allows you to
  create short lived sessions on the fly instead of using long lived access keys.
  and you use it like this.
</p>
<pre>{`
$ aws-vault exec personal -- aws sts get-caller-identity
{
    "UserId": "AIDAJM4Y5VHFHKZKCPZ4C",
    "Account": "184272074753",
    "Arn": "arn:aws:iam::184272074753:user/henrik"
}
`.trim()}</pre>
<p>
  Here we are telling aws-vault to <b>exec</b>(ute) a command using the
  <b>personal</b> profile, and as you can see that makes the aws cli happy.
</p>
<p>So if we start the server with aws-vault..</p>
<pre>{`
$ aws-vault exec personal -- yarn run dev                                                                                                                           main ✖ ✱ ◼
yarn run v1.22.17
$ svelte-kit dev

  SvelteKit v1.0.0-next.212

  local:   http://localhost:3000
  network: not exposed
`.trim()}</pre>
<p>..and we make the request..</p>
<pre>{`
$ http://localhost:3000/experiments/pulumi/up
{"name":"automation-test","preview":{"create":2}}
`.trim()}</pre>
<p>..it works!</p>
<pre>{`
getting stack..
installing aws plugin..
setting aws region..
previewing stack..
Previewing update (automation-test)


View Live: https://app.pulumi.com/henriiik/dev/automation-test/previews/aeed9093-bf22-4002-9b73-fa411d691832




 +  pulumi:pulumi:Stack dev-automation-test create

 +  aws:s3:Bucket automation-bucket create

 +  pulumi:pulumi:Stack dev-automation-test create

Resources:
    + 2 to create
`.trim()}</pre>
<p>.. without errors!</p>
<p>It does take quite a while though.</p>
<pre>{`
$ time curl http://localhost:3000/experiments/pulumi/up > /dev/null
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    49    0    49    0     0      3      0 --:--:--  0:00:14 --:--:--    12
curl http://localhost:3000/experiments/pulumi/up > /dev/null  0.01s user 0.01s system 0% cpu 14.120 total
`.trim()}</pre>
<p>
  Around 14 seconds. But the log of the server is updating continously, so it
  would be great this ran over websocket instead of http.. Unfortunately, <a
    href="https://vercel.com/support/articles/do-vercel-serverless-functions-support-websocket-connections"
    >vercel (that i use to host my site) does not support websockets natively</a
  >, so that will be an adventure for another day.
</p>
<p>
  In the end we don't want to run pulumi if the credentials are not set up
  correctly, so for now we will just add a simple check of the environment
  variables
</p>
<pre>{`
export async function up() {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw Error("AWS_ACCESS_KEY_ID not set up");
  }

  // same as before
}
`.trim()}</pre>
<p>
  And the server will tell us right away, if we have not set up our credentials.
  Which we of course won't for the public website, since this is just an
  experiment, and there is no access check whatsoever. (Update: Turns out this
  was incorrect. Vercel runs on AWS Lambda where <b>AWS_ACCESS_KEY_ID</b> is always
  defined, but pulumi is not installed so with code in this version the request will
  crash "gracefully" anyway.)
</p>
<pre>{`
$ curl http://localhost:3000/experiments/pulumi/up
{"error":"Error: AWS_ACCESS_KEY_ID not set up"}
`.trim()}</pre>
<p>Good enough for now.</p>
<p>
  It bothered me that the type of the requst handler did not differentiate the
  bodys for success and error responses, so i made some custom type and a helper
  to make it more clean. If you want the details on the types you can <a
    href="https://github.com/henriiik/experiments/blob/2877d2a3126a83046d76fe1510d0c986faf36f38/src/lib/endpoint.ts"
    >checkout endpoint.ts on GitHub</a
  >, but it allows us to write the following in <b>up.ts</b> (with equivalent error
  handling):
</p>
<pre>{`
import { handler } from "../../../lib/endpoint";
import { up, type UpResponse } from "../../../lib/pulumi/automation";

export const get = handler<UpResponse>(async (req) => {
  let body = await up();
  return { body };
});
`.trim()}</pre>
<p>And in the end <b>automation.ts</b> looks like this:</p>
<pre>{`
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const args: pulumi.automation.InlineProgramArgs = {
  program: async () => {
    let bucket = new aws.s3.Bucket("automation-bucket");
    return { bucketArn: bucket.arn };
  },
  projectName: "automation-test",
  stackName: "dev",
};

export type UpResponse = { name: string; preview: pulumi.automation.OpMap };

export async function up(): Promise<UpResponse> {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw Error("AWS_ACCESS_KEY_ID not set up");
  }

  console.log("getting stack..");
  const stack = await pulumi.automation.LocalWorkspace.createOrSelectStack(
    args
  );

  console.log("installing aws plugin..");
  await stack.workspace.installPlugin("aws", "v4.33.0");

  console.log("setting aws region..");
  await stack.setConfig("aws:region", { value: "eu-north-1" });

  console.log("previewing stack..");
  let preview = await stack.preview({ onOutput: console.log });

  console.log("done!");
  return { name: stack.name, preview: preview.changeSummary };
}

process.on("unhandledRejection", (reason, promise) => {
  if (
    reason instanceof Error &&
    reason.stack?.includes("node_modules/@pulumi")
  ) {
    console.warn("Unhandled Pulumi Rejection:", reason.message);
  } else {
    console.warn("Unhandled Rejection at:", promise, "reason:", reason);
  }
});
`.trim()}</pre>
<p>
  The astute reader will see that I have switched the project and stack names as
  well, to what i intended from the beginning.
</p>
<p>Thats it for now, see you next time!</p>
