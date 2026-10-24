import test from "node:test";
import assert from "node:assert/strict";
import {impossibleJump, policySatisfied} from "../apps/api/src/academy";

type State = Parameters<typeof policySatisfied>[2];

const state = (over: Partial<State>): State => ({
  positionSeconds: 380,
  durationSeconds: 420,
  engagedSeconds: 340,
  readingSeconds: 340,
  handoff: true,
  quizPassed: false,
  ...over,
});

test("academy: seek-to-end sem engaged nunca satisfaz a policy de vídeo", () => {
  // posição 100% mas engaged < 80% → não completa
  assert.equal(policySatisfied("VIDEO_STANDARD_V1", {position_pct: 90, engaged_pct: 80}, state({positionSeconds: 420, engagedSeconds: 100})), false);
  assert.equal(policySatisfied("VIDEO_STANDARD_V1", {position_pct: 90, engaged_pct: 80}, state({})), true);
});

test("academy: salto de posição >120s sem engaged correspondente é rejeitado", () => {
  assert.equal(impossibleJump(0, 0, 300, 0), true);
  assert.equal(impossibleJump(0, 0, 100, 0), false); // dentro do limite
  assert.equal(impossibleJump(0, 0, 300, 300), false); // engaged correspondente
});

test("academy: hybrid ANY/QUIZ e telegram exigem as suas condições", () => {
  assert.equal(policySatisfied("HYBRID_ANY_V1", {any_of: ["VIDEO_STANDARD_V1", "READER_STANDARD_V1"]}, state({})), true);
  assert.equal(policySatisfied("HYBRID_QUIZ_V1", {any_of: ["VIDEO_STANDARD_V1"], require_quiz: true}, state({})), false);
  assert.equal(policySatisfied("TELEGRAM_SELF_ATTESTED_V1", {require_handoff: true, completion_method: "SELF_ATTESTED"}, state({handoff: false})), false);
  assert.equal(policySatisfied("TELEGRAM_SELF_ATTESTED_V1", {require_handoff: true, completion_method: "SELF_ATTESTED"}, state({})), true);
});

test("academy: QUIZ_VERIFIED telegram policy never completes on handoff alone", () => {
  const rules = {require_handoff: true, completion_method: "QUIZ_VERIFIED"};
  assert.equal(policySatisfied("TELEGRAM_QUIZ_VERIFIED_V1", rules, state({quizPassed: false})), false);
  assert.equal(policySatisfied("TELEGRAM_QUIZ_VERIFIED_V1", rules, state({handoff: false, quizPassed: true})), false);
  assert.equal(policySatisfied("TELEGRAM_QUIZ_VERIFIED_V1", rules, state({quizPassed: true})), true);
});
