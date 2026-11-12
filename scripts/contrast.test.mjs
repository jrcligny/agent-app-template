import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../apps/web/src/index.css", import.meta.url), "utf8");

test("the stylesheet keeps the approved cyan and slate colors", () => {
  for (const hex of ["#f0fdfa", "#0f172a", "#ffffff", "#06b6d4", "#f8fafc", "#1e293b"]) {
    assert.match(css, new RegExp(hex, "i"));
  }
  assert.doesNotMatch(css, /#1d6b45|#1d4a38|#e8f6ee/i);
});

test("critical pairs meet AA, and the rejected cyan text pairs do not", () => {
  assert.ok(ratio("#0F172A", "#06B6D4") >= 7);
  assert.ok(ratio("#FFFFFF", "#06B6D4") < 4.5);
  assert.ok(ratio("#F8FAFC", "#06B6D4") < 4.5);
  assert.ok(ratio("#06B6D4", "#F0FDFA") < 3);
  assert.ok(ratio("#06B6D4", "#FFFFFF") < 3);
  assert.ok(ratio("#06B6D4", "#0F172A") >= 7);
  assert.ok(ratio("#06B6D4", "#1E293B") >= 4.5);
  assert.ok(ratio("#0F172A", "#F0FDFA") >= 7);
  assert.ok(ratio("#0F172A", "#FFFFFF") >= 7);
  assert.ok(ratio("#F8FAFC", "#0F172A") >= 7);
  assert.ok(ratio("#F8FAFC", "#1E293B") >= 7);
  assert.ok(ratio("#334155", "#F0FDFA") >= 7);
  assert.ok(ratio("#94A3B8", "#0F172A") >= 4.5);
  assert.ok(ratio("#94A3B8", "#1E293B") >= 4.5);
  assert.ok(ratio("#64748B", "#F0FDFA") >= 3);
  assert.ok(ratio("#7F1D1D", "#F0FDFA") >= 7);
  assert.ok(ratio("#7F1D1D", "#FEE2E2") >= 4.5);
  assert.ok(ratio("#FECACA", "#1E293B") >= 7);
});

function ratio(a, b) {
  const hi = Math.max(lum(a), lum(b));
  const lo = Math.min(lum(a), lum(b));
  return (hi + 0.05) / (lo + 0.05);
}

function lum(hex) {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((start) => {
    const channel = parseInt(value.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
