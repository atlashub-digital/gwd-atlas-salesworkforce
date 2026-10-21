// GWD SMS bridge v8 — FINAL: Supabase Send-SMS hook {metadata,user,sms:{otp,phone}} → Evolution relay
const http = require("http");
const env = { ...process.env };
for (const l of require("fs").readFileSync(process.env.ENV_FILE || "/env", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const PORT = 3140;
const INSTANCE = env.GWD_INSTANCE || "gwd-maia-wa";
const PATH_TOKEN = env.SMS_HOOK_PATH_TOKEN || "";
const RELAY = env.EVOLUTION_BASE_URL.replace(/\/$/, "");
const TOKEN = env.EVOLUTION_RELAY_TOKEN;
const DEBUG = env.BRIDGE_DEBUG === "1";

http.createServer(async (req, res) => {
  if (req.method !== "POST") { res.writeHead(405); return res.end(); }
  let body = "";
  req.on("data", (c) => { body += c; if (body.length > 1e6) req.destroy(); });
  req.on("end", async () => {
    try {
      const url = new URL(req.url, "http://x");
      if (!PATH_TOKEN || url.pathname !== "/sms-hook/" + PATH_TOKEN) {
        console.warn("REJECT: path token inválido");
        res.writeHead(404); return res.end();
      }
      const p = JSON.parse(body || "{}");
      if (DEBUG) console.log("HOOK:", body.slice(0, 200), "...");
      const phone = (p.sms && p.sms.phone) || (p.user && p.user.phone) || p.phone || "";
      const otp = (p.sms && p.sms.otp) || p.otp || p.token || "";
      const e164 = phone ? (phone.startsWith("+") ? phone : "+" + phone) : "";
      if (!e164 || !otp) {
        console.warn("MISSING phone/otp");
        res.writeHead(400); return res.end();
      }
      const text = `GWD — o teu código de acesso é ${otp}. Não partilhes este código com ninguém.`;
      const r = await fetch(RELAY + "/sendText", {
        method: "POST",
        headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName: INSTANCE, number: e164, text }),
      });
      console.log("relay:", r.status, e164.slice(0, 6) + "***");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end("{}");
    } catch (e) {
      console.error("bridge error", e.message);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end("{}");
    }
  });
}).listen(PORT, "0.0.0.0", () => console.log("gwd-sms-bridge v8 on", PORT));
