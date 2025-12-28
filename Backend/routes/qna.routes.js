const express = require("express");
const router = express.Router();
const QnaQuestion = require("../models/QnaQuestion");

/**
 * GET /api/qna
 * query: search, category, status (open|answered)
 * PUBLIC (no auth check)
 */
router.get("/", async (req, res) => {
  try {
    const { search, category, status } = req.query;

    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const questions = await QnaQuestion.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(questions);
  } catch (err) {
    console.error("Q&A GET error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/qna
 * body: { title, details, category, tags, askedBy }
 * askedBy comes from frontend (localStorage user)
 */
router.post("/", async (req, res) => {
  try {
    const { title, details, category, tags, askedBy } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!askedBy || !askedBy._id) {
      return res
        .status(400)
        .json({ message: "askedBy with _id is required" });
    }

    const cleanTags = Array.isArray(tags)
      ? tags
      : String(tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    const question = await QnaQuestion.create({
      title: title.trim(),
      details: details || "",
      category: category || "Platform Help",
      tags: cleanTags,
      status: "open",
      askedBy: {
        _id: askedBy._id,
        name: askedBy.name || "Unknown",
        role: askedBy.role || "freelancer",
        avatarUrl: askedBy.avatarUrl || "",
      },
    });

    return res.status(201).json(question);
  } catch (err) {
    console.error("Q&A CREATE error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/qna/:id/answer
 * body: { answer, answeredBy }
 * answeredBy comes from frontend (localStorage user)
 */
router.post("/:id/answer", async (req, res) => {
  try {
    const { answer, answeredBy } = req.body;
    const { id } = req.params;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: "Answer is required" });
    }
    if (!answeredBy || !answeredBy._id) {
      return res
        .status(400)
        .json({ message: "answeredBy with _id is required" });
    }

    const question = await QnaQuestion.findById(id);
    if (!question) return res.status(404).json({ message: "Not found" });

    question.answer = answer.trim();
    question.status = "answered";
    question.answeredBy = {
      _id: answeredBy._id,
      name: answeredBy.name || "Unknown",
      role: answeredBy.role || "client",
      avatarUrl: answeredBy.avatarUrl || "",
    };

    await question.save();

    res.json(question);
  } catch (err) {
    console.error("Q&A ANSWER error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
