const cfg = window.PORTFOLIO_CONFIG || {};
const ready = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
const client = ready ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
const $ = id => document.getElementById(id);
const loginPanel = $("loginPanel"), dashboard = $("dashboard");
function message(id, text){ $(id).textContent = text; }
async function showSession(){
  if(!client) return;
  const {data:{session}} = await client.auth.getSession();
  loginPanel.hidden = !!session; dashboard.hidden = !session;
  if(session) await loadItems();
}
$("loginForm").addEventListener("submit", async e=>{
  e.preventDefault();
  if(!client){message("loginStatus","Please add your Supabase URL and anon key in config.js first.");return;}
  message("loginStatus","Signing in…");
  const {error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});
  if(error){message("loginStatus",error.message);return;}
  message("loginStatus","Signed in."); await showSession();
});
$("logoutBtn").addEventListener("click",async()=>{await client.auth.signOut();await showSession();});
$("refreshBtn").addEventListener("click",loadItems);
async function loadItems(){
  if(!client)return;
  const {data,error}=await client.from("portfolio_items").select("*").order("created_at",{ascending:false});
  if(error){$("itemsList").textContent=error.message;return;}
  $("itemCount").textContent=data.length;
  $("itemsList").innerHTML="";
  if(!data.length){$("itemsList").innerHTML='<p class="sub">No items yet. Upload your first image above.</p>';return;}
  data.forEach(item=>{
    const row=document.createElement("div");row.className="item-row";
    const info=document.createElement("div"), title=document.createElement("strong"), meta=document.createElement("small");
    title.textContent=item.title;meta.textContent=`${item.category} · ${item.published?"Published":"Draft"}`;
    info.append(title,meta);
    const del=document.createElement("button");del.textContent="Delete";del.addEventListener("click",()=>deleteItem(item));
    row.append(info,del);$("itemsList").append(row);
  });
}
$("itemForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!client){message("formStatus","Connect Supabase first.");return;}
  const file=$("imageFile").files[0];if(!file){message("formStatus","Choose an image.");return;}
  message("formStatus","Uploading image…");
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
  const path=`${crypto.randomUUID()}.${ext}`;
  const {error:uploadError}=await client.storage.from("portfolio-images").upload(path,file,{upsert:false,contentType:file.type});
  if(uploadError){message("formStatus",uploadError.message);return;}
  const {data:{publicUrl}}=client.storage.from("portfolio-images").getPublicUrl(path);
  const {error}=await client.from("portfolio_items").insert({
    title:$("title").value.trim(),category:$("category").value,
    description:$("description").value.trim(),image_url:publicUrl,
    storage_path:path,published:$("published").checked
  });
  if(error){message("formStatus",error.message);return;}
  message("formStatus","Saved successfully.");$("itemForm").reset();await loadItems();
});
async function deleteItem(item){
  if(!confirm(`Delete "${item.title}"?`))return;
  const {error}=await client.from("portfolio_items").delete().eq("id",item.id);
  if(error){alert(error.message);return;}
  if(item.storage_path) await client.storage.from("portfolio-images").remove([item.storage_path]);
  await loadItems();
}
if(!ready){message("loginStatus","Setup needed: add your Supabase project URL and public anon key to config.js.");}
else{message("loginStatus","Supabase connected. Sign in with your admin account.");showSession();client.auth.onAuthStateChange(()=>showSession());}
