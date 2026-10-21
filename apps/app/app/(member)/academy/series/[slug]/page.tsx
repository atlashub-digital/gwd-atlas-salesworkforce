import SeriesDetail from "../../../../../components/academy/SeriesDetail";
export default async function Page({params}:{params:Promise<{slug:string}>}){return <SeriesDetail slug={(await params).slug}/>}
