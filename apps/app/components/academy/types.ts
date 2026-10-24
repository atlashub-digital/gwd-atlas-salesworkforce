/* Shapes returned by the GWD API (/v1/academy/*) through the authenticated app proxy. */
export type Tier="FREE"|"MEMBER"|"PREMIUM"|"CERTIFIED";
export type Mode="WEBPLAYER"|"WEBREADER"|"HYBRID"|"TELEGRAM"|"EXTERNAL";
export type Asset={kind:string;assetId:string;url?:string;durationSeconds?:number;title?:string;sections?:{heading:string;body:string}[];resources?:{title:string;description:string}[];quiz?:{id:string;prompt:string;options:string[]}[]};
export type ApiEpisode={id:string;slug:string;seriesSlug:string;seasonNumber:number;number:number;code:string;title:string;summary:string;episodeType:string;deliveryMode:Mode;provider:string;accessTier:Tier;hybridPolicy?:string;durationSeconds:number;assets:Asset[]};
export type ApiSeries={id:string;slug:string;title:string;subtitle:string;description:string;category:string;featured?:boolean;seasons:{number:number;title:string;episodeIds:string[]}[];episodes:ApiEpisode[]};
export type Progress={episode_id:string;status:"NOT_STARTED"|"IN_PROGRESS"|"COMPLETED";last_position_seconds:number;duration_seconds:number;engaged_seconds:number;progress_percent:number;completion_method:string|null};
export type Summary={continueLearning:{episodeId:string;episodeSlug:string;episodeTitle:string;seriesSlug:string;seriesTitle:string;progressPercent:number}[];xp:{total:number};badges:{id:string;label:string}[];series:{slug:string;total:number;completed:number;percent:number}[]};
export type EpisodeState={episodeSlug:string;status:Progress["status"];progressPercent:number};
