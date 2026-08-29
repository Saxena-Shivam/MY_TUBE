import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

export async function withLikeStats(docs, { field, userId }) {
  const items = (docs || []).map((doc) =>
    doc?.toObject ? doc.toObject() : doc
  );
  const ids = items.map((item) => item?._id).filter(Boolean);
  if (!ids.length) return items;

  const likes = await Like.find({ [field]: { $in: ids } });
  const counts = {};
  const unlikeCounts = {};
  const reactions = new Map();

  for (const like of likes) {
    const id = like[field]?.toString();
    if (!id) continue;
    const reaction = like.reaction || "like";
    if (reaction === "unlike") unlikeCounts[id] = (unlikeCounts[id] || 0) + 1;
    else counts[id] = (counts[id] || 0) + 1;
    if (userId && like.likedBy?.toString() === userId.toString()) {
      reactions.set(id, reaction);
    }
  }

  return items.map((item) => ({
    ...item,
    likesCount: counts[item._id.toString()] || 0,
    unlikesCount: unlikeCounts[item._id.toString()] || 0,
    reaction: reactions.get(item._id.toString()) || null,
    isLiked: reactions.get(item._id.toString()) === "like",
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
