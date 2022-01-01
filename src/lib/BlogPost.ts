export type BlogPost = { slug: string; title: string; published: Date };
export function postUrl(post: BlogPost) {
  return `/experiments/blog/posts/${post.slug}`;
}
