import readline from "node:readline";
import fs from "node:fs";
import slugify from "@sindresorhus/slugify";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const today = new Date().toISOString().split("T")[0];

const makePrematter = (title) => `---
title: ${title}
description: ""
pubDate: ${today}
---

Let's write!
`;

rl.question(`🚀 What's the title? `, (title) => {
  if (!title) {
    console.error("❌ Title is required");
    process.exit(1);
  }

  const slug = slugify(title);
  fs.writeFileSync(`./src/content/blog/${slug}.md`, makePrematter(title));
  rl.close();
});
