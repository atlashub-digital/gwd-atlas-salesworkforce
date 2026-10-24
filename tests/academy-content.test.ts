import test from "node:test";
import assert from "node:assert/strict";
import {series} from "../apps/web/lib/academy/catalog";
import {seedStatements} from "../packages/db/seed-academy";

/* Content contract (docs/execution/CONTENT_CONTRACT_GWD_START.md) checked on the published catalogue. */
const start = series.find(s => s.slug === "gwd-start");

test("published catalogue is GWD Start only, with stable slugs", () => {
  assert.deepEqual(series.map(s => s.slug), ["gwd-start"]);
  assert.deepEqual(start?.episodes.map(e => e.slug), ["boas-vindas-gwd", "o-teu-ponto-de-partida", "tres-caminhos", "verificacao-fundamentos", "etica-e-confianca", "rotina-de-aprendizagem"]);
  assert.ok(start?.episodes.every(e => e.accessTier === "FREE" || e.accessTier === "MEMBER"));
});

test("GWD Start episodes respect the content contract", () => {
  for (const ep of start?.episodes ?? []) {
    assert.ok(ep.title.length <= 70 && ep.summary.length <= 160, ep.slug);
    const reader = ep.assets.find(a => a.kind === "reader");
    assert.ok(reader?.sections?.length, `${ep.slug}: reader`);
    for (const section of reader.sections ?? []) {
      const words = section.body.split(/\s+/).filter(Boolean).length;
      assert.ok(section.heading.length <= 70 && words >= 80 && words <= 400, `${ep.slug} / ${section.heading}: ${words} words`);
      assert.doesNotMatch(section.body, /<[a-z]/i, "no HTML in reader content");
    }
    const quiz = ep.assets.find(a => a.kind === "quiz")?.quiz;
    if (ep.episodeType === "QUIZ") assert.ok(quiz?.length, `${ep.slug}: quiz required`);
    for (const q of quiz ?? []) {
      assert.ok(q.prompt.length <= 200 && q.options.length >= 3 && q.options.length <= 4, q.id);
      assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < q.options.length, q.id);
      assert.equal(new Set(q.options).size, q.options.length, `${q.id}: duplicated option`);
    }
    if (quiz) assert.ok(quiz.length >= 3 && quiz.length <= 8 && new Set(quiz.map(q => q.id)).size === quiz.length, ep.slug);
  }
});

test("production seed never publishes the demo fixtures", () => {
  const sql = seedStatements().join("\n");
  assert.doesNotMatch(sql, /'conecta-que-converte','Conecta/);
  assert.match(sql, /set status='DRAFT', featured=false[^;]*'conecta-que-converte','domina-instagram'/);
  assert.match(seedStatements({includeDemo: true}).join("\n"), /'domina-instagram'/);
});
