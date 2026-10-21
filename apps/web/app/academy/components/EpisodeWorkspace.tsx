"use client";
/* Workspace do episódio — 4 modos de delivery:
   WEBPLAYER (shell 16:9 com heartbeat 25s) · WEBREADER (leitor tipográfico com
   progresso de leitura) · HYBRID (tabs Vídeo|Ler|Recursos|Notas, policy ANY/BOTH/QUIZ)
   · TELEGRAM (handoff + SELF_ATTESTED/QUIZ_VERIFIED) · EXTERNAL (confirmação).
   NUNCA conclui por seek-to-end: engaged_seconds é o travão (GAMIFICATION.md). */
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";
import type {Episode, EpisodeProgress, Series} from "../../../lib/academy/types";
import {providerFor} from "../../../lib/academy/providers";
import {completionRuleMet, formatDuration, getAllProgress, markCompleted, sendHeartbeat} from "../../../lib/academy/progress";
import {createTelegramHandoff} from "../actions";
import {TierChip} from "./bits";

type Tab = "video" | "ler" | "recursos" | "notas";

export default function EpisodeWorkspace({series, episode, locked}:{series:Series;episode:Episode;locked:boolean}){
  const provider = useMemo(() => providerFor(episode), [episode]);
  const mode = episode.deliveryMode;
  const tabs: Tab[] = [];
  if (mode === "WEBPLAYER" || mode === "HYBRID") tabs.push("video");
  if (mode === "WEBREADER" || mode === "HYBRID") tabs.push("ler");
  if (episode.assets.some(a => a.kind === "resource")) tabs.push("recursos");
  tabs.push("notas");

  const [progress, setProgress] = useState<EpisodeProgress | null>(null);
  const [tab, setTab] = useState<Tab>(tabs[0] ?? "notas");
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [readSections, setReadSections] = useState(0);
  const [notes, setNotes] = useState("");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [handoff, setHandoff] = useState<{token: string | null; note: string} | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const simRef = useRef<{position: number; engaged: number; timer: ReturnType<typeof setInterval> | null}>({position: 0, engaged: 0, timer: null});
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastEngagedRef = useRef<number>(0);

  const videoAsset = episode.assets.find(a => a.kind === "video");
  const readerAsset = episode.assets.find(a => a.kind === "reader");
  const quizAsset = episode.assets.find(a => a.kind === "quiz");
  const resourceAsset = episode.assets.find(a => a.kind === "resource");
  const duration = videoAsset?.durationSeconds ?? episode.durationSeconds;

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const sim = simRef.current;
    sim.position = Math.min(currentTime, duration);
    sim.engaged = Math.min(sim.engaged + (currentTime - (lastEngagedRef.current || currentTime)), duration);
    lastEngagedRef.current = currentTime;
    setProgress(prev => prev ? {...prev, last_position_seconds: sim.position, engaged_seconds: sim.engaged, progress_percent: duration > 0 ? Math.min(Math.round(sim.position / duration * 100), 99) : 0, status: "IN_PROGRESS"} : prev);
  }, [duration]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setEnded(true);
  }, []);

  const handlePause = useCallback(() => {
    setPlaying(false);
  }, []);

  const handlePlay = useCallback(() => {
    setPlaying(true);
  }, []);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  // Resolve real playback URL from provider (ATLAS_MEDIA gateway)
  useEffect(() => {
    if (locked) { setPlaybackUrl(null); return; }
    if (videoAsset && provider.capabilities.video) {
      setLoadingUrl(true);
      provider.getAssetUrl(videoAsset).then(url => {
        setPlaybackUrl(url);
        setLoadingUrl(false);
      }).catch(() => setLoadingUrl(false));
    }
  }, [locked, videoAsset, provider]);

  const load = useCallback(() => {getAllProgress().then(p => setProgress(p[episode.id] ?? null));}, [episode.id]);
  useEffect(() => {load();}, [load]);

  // No simulated clock: only an authorized video can produce playback heartbeats.
  useEffect(() => {
    if (locked || !playbackUrl || !playing) return;
    const timer = setInterval(() => {
      const current = simRef.current;
      void sendHeartbeat({episode, lastPositionSeconds: current.position, engagedSeconds: current.engaged, durationSeconds: duration}).then(setProgress);
    }, 25000);
    return () => clearInterval(timer);
  }, [locked, playbackUrl, playing, episode, duration]);

  const percent = progress?.progress_percent ?? 0;
  const readerPercent = readerAsset ? Math.round((readSections / (readerAsset.sections?.length ?? 1)) * 100) : 0;

  const tryComplete = async (method: EpisodeProgress["completion_method"]) => {
    if (locked || ((mode === "WEBPLAYER" || (mode === "HYBRID" && tab === "video")) && !playbackUrl)) return;
    if (method === "SEEK_GUARDED") {
      const p = await sendHeartbeat({episode, lastPositionSeconds: simRef.current.position, engagedSeconds: simRef.current.engaged, durationSeconds: duration});
      if (!completionRuleMet(p, ended)) {setMessage("Ainda não cumpre a regra de conclusão (≥90% posição e ≥80% envolvimento). Saltar para o fim não conclui."); setProgress(p); return;}
    }
    const done = await markCompleted(episode, method ?? "SEEK_GUARDED");
    setProgress(done);
    setMessage("Episódio concluído (demo — a conclusão real será sempre validada pelo servidor).");
  };
  const completeReader = async () => {
    if (readSections < (readerAsset?.sections?.length ?? 0)) {setMessage("Lê todas as secções antes de concluir a leitura."); return;}
    const p = await sendHeartbeat({episode, lastPositionSeconds: duration, engagedSeconds: duration * 0.95, durationSeconds: duration});
    await tryComplete("SEEK_GUARDED");
    setProgress(p);
  };
  const answerQuiz = async (idx: number) => {
    setQuizAnswer(idx);
    if (!quizAsset?.quiz) return;
    if (idx === quizAsset.quiz[0].correctIndex) {
      const done = await markCompleted(episode, "QUIZ_VERIFIED");
      setProgress(done);
      setMessage("Quiz passado — conclusão QUIZ_VERIFIED (demo).");
    } else {
      setMessage("Resposta incorreta. Podes tentar novamente.");
    }
  };
  const openTelegram = async () => {
    const h = await createTelegramHandoff(episode.id);
    setHandoff({token: h.token, note: h.note});
    // TELEGRAM_HANDOFF_OPENED não é conclusão e não dá XP (GAMIFICATION.md).
    setMessage(h.note);
  };

  if (locked) {
    return (
      <section className="ac-lock" aria-label="Episódio bloqueado">
        <TierChip tier={episode.accessTier}/>
        <h2>Este episódio exige {episode.accessTier === "CERTIFIED" ? "certificação" : episode.accessTier === "PREMIUM" ? "Premium" : "membership"}.</h2>
        <p>O acesso é validado pelo servidor através do ARO (autoridade de entitlement). Nesta demo o participante é FREE, por isso o conteúdo fica bloqueado. Nenhum invite de Telegram ou media é exposto nesta página.</p>
        <p className="small">TODO(POST /v1/academy): fluxo ARO → checkout → revalidação → desbloqueio.</p>
        <Link className="button" href="/entrar">Saber mais sobre o Premium ↗</Link>
      </section>
    );
  }

  return (
    <div>
      {mode === "WEBPLAYER" || (mode === "HYBRID" && tab === "video") ? (
        <div>
          <div className="ac-player" role="region" aria-label="WebPlayer">
            <div className="ac-player-inner">
              <span className="ac-player-badge">{playbackUrl ? "WebPlayer · ATLAS_MEDIA" : "AINDA NÃO ATIVADO"}</span>
              {playbackUrl ? (
                <video
                  ref={videoRef}
                  controls
                  className="ac-video"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  onPause={handlePause}
                  onPlay={handlePlay}
                >
                  <source src={playbackUrl} type="application/vnd.apple.mpegurl" />
                </video>
              ) : (
                <>
                  <p role="status">{loadingUrl ? "A verificar o acesso…" : "EM PREPARAÇÃO · Este vídeo ainda não está disponível para reprodução."}</p>
                </>
              )}
            </div>
            <div className="ac-player-hud">
              <div className="progress" role="progressbar" aria-label="Progresso do vídeo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{width:`${percent}%`}}/></div>
              <div className="ac-player-hud-row">
                <span>{formatDuration(progress?.last_position_seconds ?? 0)} / {formatDuration(duration)}</span>
                <span>envolvimento {formatDuration(progress?.engaged_seconds ?? 0)} · {percent}%</span>
              </div>
            </div>
          </div>
          <div className="actions" style={{marginTop:"var(--space-4)",display:"flex",gap:"var(--space-3)",flexWrap:"wrap"}}>
            {playbackUrl ? (
              <>
                {playing ? <button type="button" className="button secondary" onClick={() => videoRef.current?.pause()}>Pausar</button> : <button type="button" className="button" onClick={() => videoRef.current?.play()}>Reproduzir</button>}
                <button type="button" className="button secondary" onClick={() => tryComplete("SEEK_GUARDED")}>Marcar posição atual</button>
              </>
            ) : (
              <>
                <button type="button" className="button" disabled>AINDA NÃO ATIVADO</button>
              </>
            )}
          </div>
          {message && <p className="small" role="status" style={{marginTop:"var(--space-3)"}}>{message}</p>}
        </div>
      ) : null}

      {mode === "WEBREADER" || (mode === "HYBRID" && tab === "ler") ? (
        readerAsset ? (
          <div className="ac-reader">
            {readerAsset.sections?.map((sec, i) => (
              <section key={sec.heading} onMouseEnter={() => setReadSections(v => Math.max(v, i + 1))}>
                <h3>{sec.heading}</h3>
                <p>{sec.body}</p>
              </section>
            ))}
            <p className="ac-reader-progress">Leitura: {readerPercent}% · secção mais distante {readSections}/{readerAsset.sections?.length ?? 0}</p>
            {mode === "WEBREADER" && <button type="button" className="button" onClick={completeReader}>Concluir leitura</button>}
          </div>
        ) : null
      ) : null}

      {quizAsset && (mode === "WEBREADER" || (mode === "HYBRID" && tab === "ler")) ? (
        <div className="ac-quiz" style={{marginTop:"var(--space-5)"}}>
          <form onSubmit={e => e.preventDefault()}>
            <fieldset>
              <legend>{quizAsset.quiz![0].prompt}</legend>
              {quizAsset.quiz![0].options.map((opt, i) => (
                <label key={opt}>
                  <input type="radio" name={`quiz-${episode.id}`} checked={quizAnswer === i} onChange={() => answerQuiz(i)}/>
                  {opt}
                </label>
              ))}
            </fieldset>
            {message && <p className="ac-quiz-result" data-state={quizAnswer === quizAsset.quiz![0].correctIndex ? "pass" : "fail"} role="status">{message}</p>}
          </form>
        </div>
      ) : null}

      {mode === "TELEGRAM" ? (
        <div className="ac-handoff">
          <h3>Este episódio é entregue no Telegram</h3>
          <p>A biblioteca longa da série vive num canal privado dedicado. O handoff é gerado pelo servidor (token opaco, efémero) — nunca existe invite permanente no HTML. Abrir o Telegram <strong>não</strong> conclui o episódio.</p>
          <div className="actions" style={{display:"flex",gap:"var(--space-3)",flexWrap:"wrap"}}>
            <button type="button" className="button" onClick={openTelegram}>Continuar no Telegram ↗</button>
            {handoff?.token && <button type="button" className="button secondary" onClick={() => tryComplete("SELF_ATTESTED")}>Concluir episódio na GWD (SELF_ATTESTED)</button>}
          </div>
          {handoff && <p className="small">Token: <span className="ac-token">{handoff.token}</span> · expira em {15} min · {handoff.note}</p>}
          {message && <p className="small" role="status">{message}</p>}
          <p className="small">Conclusão por SELF_ATTESTED (default do catálogo ordinário). Conteúdo crítico de certificação usa QUIZ_VERIFIED.</p>
        </div>
      ) : null}

      {mode === "EXTERNAL" ? (
        <div className="ac-handoff">
          <h3>Recurso externo</h3>
          <p>Este episódio abre numa plataforma externa. A GWD mantém o catálogo e o progresso; o provider EXTERNAL não devolve media interna.</p>
          <div className="actions" style={{display:"flex",gap:"var(--space-3)",flexWrap:"wrap"}}>
            <button type="button" className="button secondary" onClick={() => tryComplete("SELF_ATTESTED")}>Confirmar que consultei (EXTERNAL_COMPLETION_CONFIRMED)</button>
          </div>
          {message && <p className="small" role="status">{message}</p>}
        </div>
      ) : null}

      {tabs.length > 1 && mode === "HYBRID" ? (
        <>
          <div className="ac-tabs" role="tablist" aria-label="Modos do episódio">
            {tabs.map(t => (
              <button key={t} type="button" role="tab" className="ac-tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === "video" ? "Vídeo" : t === "ler" ? "Ler" : t === "recursos" ? "Recursos" : "Notas"}
              </button>
            ))}
          </div>
          {tab === "recursos" && resourceAsset?.resources ? (
            <div className="ac-tabpanel">
              <ul className="ac-list-reset">
                {resourceAsset.resources.map(r => <li key={r.title}><strong>{r.title}</strong> — {r.description}</li>)}
              </ul>
            </div>
          ) : null}
          {tab === "notas" ? (
            <div className="ac-tabpanel ac-notes">
              <label htmlFor="ac-notes-field">Notas do episódio (guardadas no dispositivo, demo)</label>
              <textarea id="ac-notes-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Escreve o que queres recordar deste episódio…"/>
            </div>
          ) : null}
        </>
      ) : tabs.length === 1 && tabs[0] === "notas" ? (
        <div className="ac-tabpanel ac-notes">
          <label htmlFor="ac-notes-field">Notas do episódio (guardadas no dispositivo, demo)</label>
          <textarea id="ac-notes-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Escreve o que queres recordar deste episódio…"/>
        </div>
      ) : null}

      <p className="small" style={{marginTop:"var(--space-5)",color:"var(--muted)"}}>
        Provider: {provider.kind} · capabilities: {[provider.capabilities.resume && "resume", provider.capabilities.engagedTracking && "engaged", provider.capabilities.handoff && "handoff"].filter(Boolean).join(", ") || "none"} ·
        identidade do episódio independente do provider — trocar provider não altera o progresso (anexado a episode_id).
      </p>
    </div>
  );
}
