import { demoCampaigns, demoParticipant } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <main className="shell">
      <div className="container">
        <header className="header">
          <div>
            <div className="brand">GoWorld.Digital</div>
            <div className="muted">Atlas Sales Workforce</div>
          </div>
          <span className="badge">GWD Foundation V0</span>
        </header>

        <section className="hero">
          <span className="badge">Vendedores · Afiliados · Equipas</span>
          <h1>Uma força comercial digital com regras claras e atribuição real.</h1>
          <p>
            O GWD gere pessoas que vendem: onboarding, campanhas, referrals,
            seller offers, formação, gamificação e comissão/margem. O ARO continua
            a ser a autoridade de checkout, order, pagamento e entitlement.
          </p>
          <div className="note">
            Este branch é foundation não produtivo. Sem pagamentos reais, sem
            provider secrets e sem atribuição financeira baseada no browser.
          </div>
        </section>

        <section className="grid">
          <article className="card">
            <h2>Participante</h2>
            <p className="muted">{demoParticipant.displayName}</p>
            <div className="stat">{demoParticipant.capabilities.length}</div>
            <p className="muted">capabilities ativas no modelo</p>
          </article>

          <article className="card">
            <h2>Campanhas</h2>
            <p className="muted">Catálogo elegível por vendedor/afiliado.</p>
            <div className="stat">{demoCampaigns.length}</div>
            <p className="muted">campanha seed de desenvolvimento</p>
          </article>

          <article className="card">
            <h2>Spine</h2>
            <p className="muted">Referral → ARO → attributed sale → accrual.</p>
            <div className="stat">V0</div>
            <p className="muted">contratos tipados; persistência vem a seguir</p>
          </article>
        </section>
      </div>
    </main>
  );
}
