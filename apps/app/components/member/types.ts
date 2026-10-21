import type {Participant} from "@gwd/domain";
export type Journey={steps:{id:string;title:string;points:number;body:string}[];completed:string[]};
export type Points={points:number;events:{event_key:string;points:number;created_at:string}[]};
export type Community={links:{label:string;url:string}[];member:boolean};
export type Item={id:string;title:string;body:string;owner:string};
export type Opportunity={id:string;title:string;market:string;description:string};
export type Me={participant:Participant|null;capabilities?:string[]};
