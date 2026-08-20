#!/usr/bin/env node

/**
 * 🏴‍☠️ HeyFutureJasmine! — Sprint to GitHub Issues Sync Tool
 *
 * Reads sprint JSON definitions from the sprints/ folder and synchronizes
 * them directly with GitHub Issues using the GitHub CLI (`gh`).
 *
 * Usage:
 *   node sprints/sync-to-github.mjs           # Sync all sprints
 *   node sprints/sync-to-github.mjs --dry-run # Preview issues without creating
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sprintsDir = __dirname;
const isDryRun = process.argv.includes("--dry-run");

console.log("🏴‍☠️ [HeyFutureJasmine!] Checking GitHub CLI authentication...");

try {
  execSync("gh auth status", { encoding: "utf-8", stdio: "pipe" });
  console.log("✓ GitHub CLI authenticated.\n");
} catch (err) {
  console.error("❌ GitHub CLI (gh) is not authenticated. Please run `gh auth login` first.");
  process.exit(1);
}

// Fetch existing issues and labels from GitHub
console.log("Fetching existing GitHub issues and labels...");
let existingIssues = [];
let existingLabels = new Set();

try {
  const issuesJson = execSync("gh issue list --limit 100 --json number,title", {
    encoding: "utf-8",
    stdio: "pipe"
  });
  existingIssues = JSON.parse(issuesJson || "[]");
  console.log(`Found ${existingIssues.length} existing issue(s) on GitHub.`);

  const labelsJson = execSync("gh label list --limit 100 --json name", {
    encoding: "utf-8",
    stdio: "pipe"
  });
  const parsedLabels = JSON.parse(labelsJson || "[]");
  parsedLabels.forEach((l) => existingLabels.add(l.name.toLowerCase()));
  console.log(`Found ${existingLabels.size} existing label(s) on GitHub.\n`);
} catch (err) {
  console.warn("⚠️ Warning: Could not fetch existing data, proceeding with caution.");
}

function ensureLabel(labelName) {
  if (existingLabels.has(labelName.toLowerCase())) return;
  if (isDryRun) return;

  const colorMap = {
    feature: "a2eeef",
    frontend: "5bbe7e",
    backend: "1e1230",
    "sprint-1": "f5a623",
    "sprint-2": "9b7fb0",
    "sprint-3": "e06d53",
    "sprint-4": "4a90e2",
    "sprint-5": "bd10e0",
    "sprint-6": "50e3c2",
    "priority:high": "d73a4a",
    "priority:medium": "fbca04",
    "priority:low": "0075ca",
    security: "b60205",
    reliability: "0e8a16",
    gamification: "e99695",
    "developer-experience": "bfdadc",
    mobile: "1d76db",
    pwa: "5319e7",
    audio: "c2e0c6",
    ux: "d4c5f9",
    pairing: "ff69b4",
    couples: "ff1493",
    media: "7b1fa2",
    animation: "ffb74d",
    auth: "00897b",
    devops: "3949ab"
  };

  const color = colorMap[labelName.toLowerCase()] || "cccccc";
  try {
    execSync(`gh label create "${labelName}" --color "${color}"`, { stdio: "ignore" });
    existingLabels.add(labelName.toLowerCase());
    console.log(`  ✓ Created label: "${labelName}"`);
  } catch (err) {
    // Ignore if label already created concurrently
  }
}

// Read all sprint-*.json files
const files = fs
  .readdirSync(sprintsDir)
  .filter((f) => f.startsWith("sprint-") && f.endsWith(".json"))
  .sort();

if (files.length === 0) {
  console.log("No sprint JSON files found in sprints/.");
  process.exit(0);
}

for (const file of files) {
  const filePath = path.join(sprintsDir, file);
  const sprintData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  console.log(`=======================================================`);
  console.log(`🚀 Processing: ${sprintData.title} (Sprint ${sprintData.sprint})`);
  console.log(`🎯 Goal: ${sprintData.goal}`);
  console.log(`=======================================================\n`);

  for (const issue of sprintData.issues || []) {
    const formattedTitle = `${issue.id}: ${issue.title}`;
    const alreadyExists = existingIssues.some((ex) => ex.title.includes(issue.id));

    if (alreadyExists) {
      console.log(`⏩ [Skipped] Issue already exists on GitHub: ${formattedTitle}`);
      continue;
    }

    // Ensure labels exist
    (issue.labels || []).forEach(ensureLabel);

    // Build the Markdown body
    const bodyLines = [
      `## 📖 User Story`,
      `> ${issue.user_story}`,
      ``,
      `## 🛠 Technical Scope`,
      ...Object.entries(issue.technical_scope || {}).map(
        ([area, items]) =>
          `- **${area.replace(/_/g, " ").toUpperCase()}:**\n  ${items.map((i) => `• \`${i}\``).join("\n  ")}`
      ),
      ``,
      `## ✅ Acceptance Criteria`,
      ...(issue.acceptance_criteria || []).map((ac) => `- [ ] ${ac}`),
      ``,
      `## 🧪 Mandatory End-to-End (E2E) Test Plan`,
      `> **Every issue MUST be tested and validated end-to-end before closing.**`,
      ...(issue.end_to_end_test_plan || []).map((step) => `- [ ] ${step}`),
      ``,
      `---`,
      `**Sprint:** Sprint ${sprintData.sprint} | **Priority:** \`${issue.priority}\` | **Assignee:** \`${issue.assignee || "AI Coding Agent"}\``
    ];

    const bodyContent = bodyLines.join("\n");

    if (isDryRun) {
      console.log(`[DRY RUN] Would create issue: "${formattedTitle}"`);
      console.log(`Labels: ${(issue.labels || []).join(", ")}`);
      console.log(`--------------------------------------------------`);
      continue;
    }

    console.log(`Creating GitHub Issue: "${formattedTitle}"...`);
    try {
      const tempBodyPath = path.join(sprintsDir, `.temp_issue_body_${issue.id}.md`);
      fs.writeFileSync(tempBodyPath, bodyContent, "utf-8");

      const labelFlags = (issue.labels || []).map((l) => `--label "${l}"`).join(" ");

      const cmd = `gh issue create --title "${formattedTitle.replace(/"/g, '\\"')}" --body-file "${tempBodyPath}" ${labelFlags}`;
      const output = execSync(cmd, { encoding: "utf-8" }).trim();

      if (fs.existsSync(tempBodyPath)) fs.unlinkSync(tempBodyPath);

      console.log(`✓ Created: ${output}`);
    } catch (err) {
      console.error(`❌ Failed to create issue "${formattedTitle}":`, err.message);
    }
  }
  console.log("");
}

console.log("🏴‍☠️ All sprints synchronized to GitHub successfully!");
