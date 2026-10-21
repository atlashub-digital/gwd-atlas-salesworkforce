import EpisodeView from "../../../../../../../components/academy/EpisodeView";
export default async function Page({params}:{params:Promise<{slug:string;episode:string}>}){const {slug,episode}=await params;return <EpisodeView seriesSlug={slug} episodeSlug={episode}/>}
