// routes/verifyGraduate.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const POLY_URL = process.env.POLY_URL || "https://moodle.polytechnic.bh/alsalamAPI/verify.php";
const API_KEY  = process.env.POLYTECH_API_KEY || "";
const USE_BEARER = String(process.env.POLY_AUTH_BEARER || "0") === "1";
const AUTH_HEADER_NAME = process.env.POLY_AUTH_HEADER || "X-API-Key";

if (!API_KEY) {
  console.warn("[verifyGraduate] Missing POLYTECH_API_KEY in environment!");
}

router.post("/", async (req, res) => {
  try {
    const { cpr } = req.body || {};
    if (!/^\d{9}$/.test(String(cpr || ""))) {
      return res.status(400).json({ error: "Invalid CPR format. Must be 9 digits." });
    }

    // Polytechnic PHP typically expects x-www-form-urlencoded, not JSON.
    const params = new URLSearchParams();
    params.append("cpr", String(cpr).trim());
    // Some PHP scripts are case-sensitive about keys, include both just in case.
    params.append("CPR", String(cpr).trim());

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (USE_BEARER) {
      headers["Authorization"] = `Bearer ${API_KEY}`;
    } else {
      headers[AUTH_HEADER_NAME] = API_KEY;
    }

    const r = await axios.post(POLY_URL, params.toString(), { headers, validateStatus: () => true });

    // Try to parse JSON; if not, return raw text.
    let payload;
    try {
      payload = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
    } catch {
      payload = { raw: String(r.data || "") };
    }

    // Surface common auth misconfigs with helpful hints (but never leak the key)
    if (r.status === 401 || r.status === 403) {
      console.error("[verifyGraduate] Auth to Polytechnic failed:", {
        status: r.status,
        body: payload,
        usedBearer: USE_BEARER,
        headerName: USE_BEARER ? "Authorization: Bearer" : AUTH_HEADER_NAME
      });
      return res.status(401).json({ error: "Unauthorized: Polytechnic API key rejected." });
    }

    return res.status(r.status).json(payload);
  } catch (err) {
    console.error("[verifyGraduate] Proxy error:", err?.message);
    return res.status(502).json({ error: "Verification service unavailable" });
  }
});

module.exports = router;
