import {notFound} from "next/navigation";import {navigation} from "@gwd/config";import MemberScreen from "../../../components/MemberScreen";
export default async function Page({params}:{params:Promise<{screen:string}>}){const {screen}=await params;if(screen!=="onboarding"&&!navigation.some(([key])=>key===screen))notFound();return <MemberScreen screen={screen}/>}
