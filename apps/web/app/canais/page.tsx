import type {Metadata} from "next";
import Link from "next/link";
import {Container,PageHeading,Section,Status,buttonClass} from "@gwd/ui";
import {ChannelCard,ContactCard} from "@gwd/ui/channels";
import {communityEmail,maiaContact,officialChannels} from "@gwd/config";
import SiteFrame from "../../components/SiteFrame";
import Icon from "../../components/Icon";
import {appEntryUrl} from "../../lib/site";

export const metadata:Metadata={title:"Canais oficiais",description:"Comunidade GWD no WhatsApp, Discord e Telegram, contacto com a Maia Valente e email da comunidade."};
/** Official community channels (shared config: same links as the hero and the member app). Opening an invite never
 * joins anyone automatically; the AI assistant stays "Em preparação" until it is really operational. */
export default function Page(){
 return <SiteFrame>
  <PageHeading eyebrow="Canais oficiais" title="Onde a comunidade GWD conversa." description="Estes são os únicos convites oficiais da GWD. Entrar é sempre uma escolha tua: cada plataforma pede-te confirmação antes de te juntar ao grupo."/>
  <Section><ul className="channel-list channel-list--three">{officialChannels.map(c=><li key={c.id}><ChannelCard channel={c}/></li>)}</ul></Section>
  <Section><div className="channel-split">
   <div><span className="eyebrow">Contacto pessoal</span><h2 className="channel-split-title">Fala com a Maia.</h2><p>Os grupos são para toda a comunidade. Para uma dúvida tua sobre o percurso, a Maia responde-te diretamente.</p></div>
   <ContactCard {...maiaContact} image="/media/maia-workspace-v02.webp"/>
  </div></Section>
  <Section><ul className="channel-list">
   <li><article id="assistente" className="channel-card channel-card--assistente"><span className="channel-card-icon"><Icon name="spark"/></span><div className="channel-card-body"><div className="channel-card-head"><h2>Assistente GWD (IA)</h2><Status tone="warning">EM PREPARAÇÃO</Status></div><p>Um assistente para te orientar no percurso, responder a dúvidas da Academy e ajudar-te a navegar na plataforma.</p><p className="channel-card-access"><Icon name="shield"/><span>Ainda não está ativo. Até lá, as dúvidas ficam no espaço “Dúvidas da Academy” da comunidade.</span></p></div></article></li>
   <li><article id="email" className="channel-card channel-card--email is-active"><span className="channel-card-icon"><Icon name="mail"/></span><div className="channel-card-body"><div className="channel-card-head"><h2>Email da comunidade</h2><Status tone="success">ATIVO</Status></div><p>Para assuntos da comunidade que preferes tratar por escrito.</p><a className="button secondary channel-card-action" href={"mailto:"+communityEmail}>{communityEmail}</a></div></article></li>
  </ul></Section>
  <Section><Container className="channel-cta"><p>Ainda não fazes parte? Começa pela tua conta GWD — é gratuita.</p><div className="actions"><Link className={buttonClass("primary","large")} href="/entrar">Entrar na Comunidade <span className="arrow" aria-hidden="true">→</span></Link><a className={buttonClass("secondary","large")} href={appEntryUrl}>Já participo · Entrar</a></div></Container></Section>
 </SiteFrame>;
}
