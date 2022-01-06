import { handler } from "../../../lib/endpoint";
import { up, type UpResponse } from "../../../lib/pulumi/automation";

export const get = handler<UpResponse>(async (req) => {
  let body = await up();
  return { body };
});
