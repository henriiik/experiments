import type { RequestHandler } from "@sveltejs/kit";
import { up } from "../../../lib/pulumi/automation";

export const get: RequestHandler<{}, {}, { name: string }> = async (req) => {
  let body = await up();
  return { body };
};
