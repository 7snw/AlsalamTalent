import React, { useRef, useState } from "react";

export default function SkillsInput({
  value = [],
  onChange = () => {},
  placeholder = "Type a skill and press Enter",
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const addMany = (raw) => {
    const parts = String(raw || "")
      .split(/[\n,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!parts.length) return;

    const existing = new Set(value.map((v) => v.toLowerCase()));
    const next = [...value];

    parts.forEach((p) => {
      const k = p.toLowerCase();
      if (!existing.has(k)) {
        existing.add(k);
        next.push(p);
      }
    });

    onChange(next);
  };

  const addOne = () => {
    if (!draft.trim()) return;
    addMany(draft);
    setDraft("");
  };

  const removeAt = (idx) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      addOne();
    } else if (e.key === "Backspace" && !draft) {
    
      if (value.length) removeAt(value.length - 1);
    }
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData("text");
    if (text && /[,;\n|]/.test(text)) {
      e.preventDefault();
      addMany(text);
    }
  };

  return (
    <div
      className="skills-tags-wrap"
      onClick={() => inputRef.current?.focus()}
      role="group"
      aria-label="Skills input"
    >
      {value.map((tag, i) => (
        <span key={`${tag}-${i}`} className="tag-chip">
          {tag}
          <button
            type="button"
            className="tag-x"
            aria-label={`Remove ${tag}`}
            onClick={() => removeAt(i)}
            title="Remove"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="skills-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        aria-label="Add a skill"
      />
    </div>
  );
}
