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
  } else if (!process.env.PULUMI_ACCESS_TOKEN) {
    throw Error("PULUMI_ACCESS_TOKEN not set up");
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
