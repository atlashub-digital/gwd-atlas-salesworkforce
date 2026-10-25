import test from "node:test";
import assert from "node:assert/strict";
import {communityEmail,maiaContact,officialChannels} from "../packages/config/src/index";

test("official channels: one public invite per platform, https on the platform's own invite host", () => {
  const hosts: Record<string, string> = {whatsapp: "chat.whatsapp.com", discord: "discord.gg", telegram: "t.me"};
  assert.deepEqual(officialChannels.map(c => c.id).sort(), ["discord", "telegram", "whatsapp"]);
  for (const c of officialChannels) {
    const url = new URL(c.url);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, hosts[c.id], c.id);
  }
});

test("official channels never point at the Academy's private Telegram distribution channels", () => {
  for (const c of officialChannels) assert.doesNotMatch(c.url, /t\.me\/c\/|t\.me\/[^+/]+\/\d+/);
  assert.match(officialChannels.find(c => c.id === "telegram")!.url, /^https:\/\/t\.me\/\+/);
});

test("Maia's contact and the community email are explicit and distinct from the groups", () => {
  assert.equal(maiaContact.url, "https://wa.me/" + maiaContact.phone.replace(/\D/g, ""));
  assert.match(maiaContact.note, /não é atendimento automático/);
  assert.equal(communityEmail, "comunidade@goworld.digital");
});
