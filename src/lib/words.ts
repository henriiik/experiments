export type Meta = { title: string; published?: Date };
export type PublishedMeta = Required<Meta>;

export function postUrl(slug: string) {
  return `/experiments/words/${slug}`;
}
