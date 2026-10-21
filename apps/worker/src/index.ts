import { flags } from "@gwd/config";
// No transport, commercial consumer or outbound messaging is activated in V1.
export const jobs = Object.freeze({
 notificationOutbox:"AWAITING_TRANSPORT", journeyReminders:"AWAITING_SCHEDULE",
 pointsProjection:"SYNCHRONOUS_API_LEDGER", auditMaintenance:"AWAITING_RETENTION_POLICY",
});
if(flags.aroProduction||flags.payouts)throw new Error("Commercial processing prohibited");
console.log(JSON.stringify({service:"gwd-worker",status:"booted",commerce:"OFF",jobs}));
const timer=setInterval(()=>console.log(JSON.stringify({service:"gwd-worker",status:"idle",commerce:"OFF"})),60000);
for(const signal of ["SIGINT","SIGTERM"])process.on(signal,()=>{clearInterval(timer);process.exitCode=0;});
