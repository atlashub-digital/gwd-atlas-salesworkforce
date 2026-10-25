/** Decorative line icons (24px grid, currentColor). Always aria-hidden: meaning lives in adjacent text. */
const paths={
 learn:<><path d="M2 9.5 12 5l10 4.5L12 14 2 9.5Z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/><path d="M22 9.5V15"/></>,
 globe:<><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.5 9h17M3.5 15h17"/></>,
 spark:<><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m12 8 1.4 2.6L16 12l-2.6 1.4L12 16l-1.4-2.6L8 12l2.6-1.4L12 8Z"/></>,
 tools:<><path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-2.5-2.5"/><path d="m10.5 18.5-7-7a2.1 2.1 0 0 1 3-3l7 7"/><path d="M15 4.5 19.5 9"/></>,
 route:<><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/></>,
 heart:<><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/></>,
 people:<><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.6 3-5.5 6-5.5s5.4 1.9 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.3.2 4 1.9 4.5 4.9"/></>,
 book:<><path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5V5.5Z"/><path d="M12 6v13.5"/></>,
 briefcase:<><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18"/></>,
 bag:<><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></>,
 megaphone:<><path d="M4 10v4h3l8 4V6L7 10H4Z"/><path d="M18.5 9.5a3.5 3.5 0 0 1 0 5"/></>,
 link:<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></>,
 shield:<><path d="M12 3 5 6v5.5c0 4.3 3 7.8 7 9.5 4-1.7 7-5.2 7-9.5V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
 mail:<><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></>,
 arrow:<><path d="M5 12h14M13 6l6 6-6 6"/></>,
 menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>,
 close:<><path d="m6 6 12 12M18 6 6 18"/></>
} as const;
export type IconName=keyof typeof paths;
export default function Icon({name,className}:{name:IconName;className?:string}){return <svg className={className} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>}
