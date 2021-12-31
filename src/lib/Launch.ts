import * as D from "io-ts/lib/Decoder.js";
import * as E from "fp-ts/lib/Either.js";

export const Launch = D.struct({
  mission_name: D.string,
  launch_date_local: D.string,
  links: D.struct({ video_link: D.string }),
});
export type LaunchData = D.TypeOf<typeof Launch>;

export const LaunchResponse = D.struct({
  data: D.struct({
    launchesPast: D.array(Launch),
  }),
});
export type LaunchResponseData = D.TypeOf<typeof LaunchResponse>;

export function unwrap<T>(result: E.Either<D.DecodeError, T>): T {
  if (E.isLeft(result)) {
    throw Error(D.draw(result.left));
  } else {
    return result.right;
  }
}
