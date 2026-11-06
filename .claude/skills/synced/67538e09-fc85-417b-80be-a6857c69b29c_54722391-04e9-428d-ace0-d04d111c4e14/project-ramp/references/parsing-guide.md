# KT Document Parsing Guide

How to extract text from a KT document and prepare it for section parsing.

---

## Source: Uploaded `.docx`

Use the `file-reading` skill. It routes `.docx` files to `python-docx` extraction. The output is plain text with:
- Headings preserved as `# Heading Text` or `## Heading Text`
- Tables preserved as pipe-delimited markdown (`| col | col |`)
- Bold text preserved as `**text**`
- Blank lines between paragraphs

After extraction, apply the section parser from `section-map.md`. Match section boundaries by scanning for the heading patterns listed per section.

**If the file is password-protected:** Tell the user the file can't be read and ask them to share it without a password or via Google Drive.

**If the file is very large (> 30 pages):** KT documents should be 2-4 pages. If the file is much longer, it may be the full SOW rather than the KT doc. Confirm with the user before proceeding.

---

## Source: Google Drive link

**Step 1:** Extract the file ID from the URL.
- `https://docs.google.com/document/d/{FILE_ID}/edit` → use FILE_ID
- `https://drive.google.com/file/d/{FILE_ID}/view` → use FILE_ID

**Step 2:** Call `Google Drive: read_file_content` with `fileId`. This tool returns a structured text representation of the document including headings, paragraphs, and tables. Prefer this over `download_file_content` (which returns base64 binary).

**Step 3:** Apply the section parser from `section-map.md`.

**If the Drive file is a Google Doc (not .docx):** `read_file_content` still works — it exports Google Docs as plain text. Proceed identically.

**If access is denied:** Tell the user Claude can't access the file and ask them to either share it (with the Google account connected to Claude) or attach the `.docx` directly.

---

## Supplemental document ingestion

Supplemental docs are processed after the KT document. For each:

**SOW or Change Order (.docx, .pdf, or Drive link):**
- Extract scope lines, timeline, billing type, modules, exclusions.
- Map to §4 (Scope), §9 (Licensing), §10 (Links).
- If a Change Order, note which items are additions or removals from the original SOW.
- Use `{{UPDATED}}` token on any field that differs from or supplements the KT.

**Discovery session transcripts (Granola, Fellow.ai, raw text):**
- Scan for stakeholder mentions (name + title + behavioral cues).
- Scan for scope confirmations, deferrals, or additions.
- Scan for risks or concerns raised.
- Map to §7 (Stakeholders), §4 (Scope), §8 (Risks).

**Status reports:**
- Extract: current phase, completion percentage, open action items (item, owner, due date, status).
- Extract: key decisions made, risks materialized or mitigated, upcoming milestones.
- Map to Project Status panel (mid-engagement mode) and §8 (Risks).

**Meeting notes (any format):**
- Treat like transcripts but lower fidelity. Extract named participants, decisions, and action items.
- Map to §7 (new contacts), §4 (scope confirmations), §8 (risks), and Project Status panel.

**Inline pasted text:**
- Parse as plain text. Look for structure cues (bullet points, headers, "Action Items:") to categorize.
- No `{{UPDATED}}` token on inline text — it's context, not a sourced document. Note it in the Ask Claude system prompt as "inline context from user."

**Labeling supplemental content in the Ask Claude system prompt:**

Each supplemental document's extract should be labeled by source type:
```
[SOW — Acme Corp v2.docx]
...extracted text...

[Status Report — Week 14 Update]
...extracted text...

[Meeting Notes — Discovery Call Jan 15]
...extracted text...
```

This lets the Ask Claude tab answer questions like "what did the status report say about data migration?"

---

## Section boundary detection algorithm

After you have the raw text, apply this parse pass:

```
sections = {}
current_section = null
current_lines = []

for each line in document:
  if line matches a section heading pattern (from section-map.md):
    if current_section is not null:
      sections[current_section] = join(current_lines)
    current_section = detected_section_number
    current_lines = []
  else:
    current_lines.append(line)

# Don't forget the final section
if current_section is not null:
  sections[current_section] = join(current_lines)

# Mark missing sections
for each section 1-10 not in sections:
  sections[section] = null
```

Return the `sections` dict to the artifact builder.

---

## Table extraction

Tables in `.docx` extraction come through as:
```
| Name | Title | LinkedIn | Role | Notes |
|---|---|---|---|---|
| Jane Smith | CFO | linkedin.com/in/... | Decision Maker | Very detail-oriented... |
```

Parse into:
```json
{
  "headers": ["Name", "Title", "LinkedIn", "Role", "Notes"],
  "rows": [
    ["Jane Smith", "CFO", "linkedin.com/in/...", "Decision Maker", "Very detail-oriented..."]
  ]
}
```

The React artifact expects this structured format for the Stakeholders (§7), Risks (§8), and Fit-Gap (§6) tables.

---

## Handling `NEEDS INPUT`

Replace `**NEEDS INPUT**` and `NEEDS INPUT` (with or without bold markers) with a special token: `{{NEEDS_INPUT}}`. The React renderer converts this token to the yellow-highlighted inline badge. This ensures the marker survives the markdown-to-JSX rendering step without being treated as emphasis.
