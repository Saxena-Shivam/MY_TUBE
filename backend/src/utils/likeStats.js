import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

export async function withLikeStats(docs, { field, userId }) {
  const items = (docs || []).map((doc) => (doc?.toObject ? doc.toObject() : doc));
  const ids = items.map((item) => item?._id).filter(Boolean);
  if (!ids.length) return items;

  const likes = await Like.find({ [field]: { $in: ids } });
  const counts = {};
  const liked = new Set();

  for (const like of likes) {
    const id = like[field]?.toString();
    if (!id) continue;
    counts[id] = (counts[id] || 0) + 1;
    if (userId && like.likedBy?.toString() === userId.toString()) {
      liked.add(id);
    }
  }

  return items.map((item) => ({
    ...item,
    likesCount: counts[item._id.toString()] || 0,
    isLiked: liked.has(item._id.toString()),
  }));
}

export async function withCommentCounts(docs, field = "tweet") {
  const items = docs || [];
  const ids = items.map((item) => item?._id).filter(Boolean);
  if (!ids.length) return items;

  const comments = await Comment.find({ [field]: { $in: ids } }).select(field);
  const counts = {};
  for (const comment of comments) {
    const id = comment[field]?.toString();
    if (!id) continue;
    counts[id] = (counts[id] || 0) + 1;
  }

  return items.map((item) => ({
    ...item,
    commentsCount: counts[item._id.toString()] || 0,
  }));
}
