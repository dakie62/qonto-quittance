import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DATA_PATH = join(import.meta.dirname, "..", "data", "processed.json");

function load(): string[] {
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return [];
  }
}

export function isProcessed(transactionId: string): boolean {
  return load().includes(transactionId);
}

export function markProcessed(transactionId: string): void {
  const ids = load();
  if (!ids.includes(transactionId)) {
    ids.push(transactionId);
    writeFileSync(DATA_PATH, JSON.stringify(ids, null, 2) + "\n");
  }
}
