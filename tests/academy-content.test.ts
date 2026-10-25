import test from "node:test";
import assert from "node:assert/strict";
import {series} from "../apps/web/lib/academy/catalog";
import {seedStatements} from "../packages/db/seed-academy";

/* Content contract (docs/execution/CONTENT_CONTRACT_GWD_START.md) checked on the published catalogue. */
const start = series.find(s => s.slug === "gwd-start");

test("published catalogue: GWD Start and the four learning paths, with stable slugs", () => {
  assert.deepEqual(series.map(s => s.slug), ["gwd-start", "comunidade-e-objetivos", "social-media", "afiliado-digital", "revendedor-autorizado"]);
  assert.deepEqual(start?.episodes.map(e => e.slug), ["boas-vindas-gwd", "o-teu-ponto-de-partida", "tres-caminhos", "verificacao-fundamentos", "etica-e-confianca", "rotina-de-aprendizagem"]);
  for (const s of series) {
    assert.ok(s.episodes.every(e => e.accessTier === "FREE" || e.accessTier === "MEMBER"), s.slug);
    assert.equal(new Set(s.episodes.map(e => e.id)).size, s.episodes.length, s.slug);
    assert.ok(s.episodes.some(e => e.episodeType === "QUIZ"), `${s.slug}: final verification`);
  }
  assert.equal(new Set(series.flatMap(s => s.episodes.map(e => e.id))).size, series.reduce((n, s) => n + s.episodes.length, 0), "episode ids unique across series");
});

test("no invented commercial terms in the learning paths", () => {
  for (const s of series) for (const ep of s.episodes) for (const section of ep.assets.find(a => a.kind === "reader")?.sections ?? [])
    assert.doesNotMatch(section.body.replace(/80 %/g, ""), /\d+\s?%|R\$\s?\d|\d+\s?€|€\s?\d/, `${s.slug}/${ep.slug}: no percentages or amounts (80 % = quiz pass mark)`);
});

test("published episodes respect the content contract", () => {
  for (const ep of series.flatMap(s => s.episodes)) {
    // GWD Start keeps its contract (80–400 words per section); the learning paths use shorter, practical sections.
    const minWords = ep.seriesId === "gwd-start" ? 80 : 45;
    assert.ok(ep.title.length <= 70 && ep.summary.length <= 160, ep.slug);
    const reader = ep.assets.find(a => a.kind === "reader");
    assert.ok(reader?.sections?.length, `${ep.slug}: reader`);
    for (const section of reader.sections ?? []) {
      const words = section.body.split(/\s+/).filter(Boolean).length;
      assert.ok(section.heading.length <= 70 && words >= minWords && words <= 400, `${ep.slug} / ${section.heading}: ${words} words`);
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
