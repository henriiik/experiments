export type Meta = { title: string; published: Date };
export function postUrl(slug: string) {
  return `/experiments/words/${slug}`;
}
