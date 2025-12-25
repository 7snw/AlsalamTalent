const mongoose = require("mongoose");

const QnaQuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    details: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        "Projects",
        "Submissions",
        "Payments",
        "Suggestions",
        "Other",
        "Platform Help",
      ],
      default: "Platform Help",
    },
    tags: [{ type: String, trim: true }],

    status: {
      type: String,
      enum: ["open", "answered"],
      default: "open",
    },

    askedBy: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: String,
      role: String, // "freelancer"
      avatarUrl: String,
    },

    answeredBy: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      role: String, // "client"
      avatarUrl: String,
    },

    answer: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QnaQuestion", QnaQuestionSchema);
