import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videofile: {
      type: String, //cloudnary url
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    discription: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    duration: {
      type: Number, //cloudanary url
      require: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);
