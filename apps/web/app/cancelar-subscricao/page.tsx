import type {Metadata} from "next";
import {PageHeading,Section} from "@gwd/ui";
import SiteFrame from "../../components/SiteFrame";
import UnsubscribeForm from "../../components/UnsubscribeForm";
export const metadata:Metadata={title:"Cancelar subscrição",robots:{index:false}};
/** Newsletter unsubscribe (link in every GWD email: /cancelar-subscricao?t=<token>). One click, no account needed. */
export default function Page(){
 return <SiteFrame><PageHeading eyebrow="Emails da GWD" title="Cancelar a subscrição de novidades" description="Deixas de receber as novidades da GWD por email. Os emails de acesso à tua conta continuam a funcionar."/>
  <Section><UnsubscribeForm/></Section></SiteFrame>;
}
