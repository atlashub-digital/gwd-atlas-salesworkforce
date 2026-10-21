export async function api(path:string,body?:unknown,method?:string){
 const response=await fetch("/api/gwd/"+path,{method:method??(body?"POST":"GET"),headers:{"Content-Type":"application/json"},...(body?{body:JSON.stringify(body)}:{}),cache:"no-store"});
 const data=await response.json();if(response.status===401){window.location.assign("/entrar");throw new Error("A sessão terminou.");}
 if(response.status===409&&data.code==="ONBOARDING_REQUIRED"){window.location.assign("/onboarding");throw new Error(data.error);}
 if(!response.ok)throw new Error(data.error??"Não foi possível concluir o pedido.");return data;
}
