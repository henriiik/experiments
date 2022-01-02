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
