import {cookies} from "next/headers";import {redirect} from "next/navigation";import AppShell from "../../components/AppShell";
export default async function MemberLayout({children}:{children:React.ReactNode}){const jar=await cookies();if(!jar.has("gwd-access")&&!jar.has("gwd-refresh"))redirect("/entrar");return <AppShell>{children}</AppShell>}
