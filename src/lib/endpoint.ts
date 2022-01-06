import type { RequestHandler } from "@sveltejs/kit";
import type { JSONString } from "@sveltejs/kit/types/helper";
import type { ServerRequest } from "@sveltejs/kit/types/hooks";

export type ErrorResponse = { error: string };

export type SuccessOutput<Body extends JSONString> = {
  status?: 200;
  body: Body;
};

export type InternalServerErrorOutput<Body extends JSONString> = {
  status: 500;
  body: Body;
};

export type SimpleHandler<Body extends JSONString> = (
  request: ServerRequest<{}, unknown>
) => Promise<SuccessOutput<Body> | InternalServerErrorOutput<ErrorResponse>>;

export function handler<Body extends JSONString>(
  inner: SimpleHandler<Body>
): RequestHandler<{}, unknown, Body | { error: string }> {
  return async (req) => {
    try {
      return await inner(req);
    } catch (e) {
      return {
        status: 500,
        body: { error: `${e}` },
      };
    }
  };
}
