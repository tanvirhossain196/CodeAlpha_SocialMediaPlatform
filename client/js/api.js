const API = {
  async request(path, options={}) {
    const config={method:options.method||'GET',credentials:'include',headers:{...(options.headers||{})}};
    if(options.body instanceof FormData){config.body=options.body;} else if(options.body!==undefined){config.headers['Content-Type']='application/json';config.body=JSON.stringify(options.body);}
    const res=await fetch(`/api${path}`,config);let data={};try{data=await res.json()}catch(_){data={message:'Unexpected server response.'}}
    if(!res.ok){const err=new Error(data.message||'Request failed.');err.status=res.status;err.errors=data.errors||{};throw err;}return data;
  },
  get:p=>API.request(p),post:(p,b)=>API.request(p,{method:'POST',body:b}),put:(p,b)=>API.request(p,{method:'PUT',body:b}),delete:p=>API.request(p,{method:'DELETE'})
};
window.API=API;
