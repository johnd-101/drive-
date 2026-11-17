"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Question = { 
  id: string; question: string; options: any; correct: number; 
  category: "rules" | "signs" | "controls";
  imageUrl?: string; signType?: string; controlType?: string; explanation?: string;
};
type TestResult = {
  id: string; studentName: string; studentEmail?: string;
  score: number; total: number; percentage: number; passed: boolean;
  categoryScores?: Record<string, number>; createdAt: string; category?: string;
};

const SIGN_TYPES = ["Stop","Yield","Warning","Regulatory","Informational","Speed Limit","No Entry","Pedestrian","No Parking","Crossroad","T-Junction","School","Animals","Slippery Road","Roundabout Yield","Guidance","Permanent","General","Command","Motorcars Only","Buses Only","Taxis Only","Cyclists Only","Pedestrians Only","No Overtaking","No U-Turn","No Hooting","Toll Road","Temporary","Dead End","Sharp Bend","Traffic Signal Ahead","Uneven Road","Low Aircraft","Switch Headlamps On","Keep Left"];
const CONTROL_TYPES = ["Steering","Braking","Clutch","Mirrors","Lights","Dashboard","Gears","Handbrake","Accelerator","Wipers","Safety"];

export default function AdminPage() {
  const [view, setView] = useState<"questions" | "results">("questions");
  const [questions, setQs] = useState<Question[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [form, setForm] = useState<Partial<Question>>({ question: "", options: ["","","",""], correct: 0, category: "rules", imageUrl: "", signType: "", controlType: "", explanation: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [resultSearch, setResultSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all"|"rules"|"signs"|"controls">("all");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { const res = await fetch("/api/questions"); if(res.ok){ setQs(await res.json()); } } catch {}
  };

  const loadResults = async () => {
    const { data, error } = await supabase.from("test_results").select("*").order("created_at", { ascending: false }).limit(100);
    if(error){ console.error(error); return; }
    const mapped: TestResult[] = (data || []).map((r:any)=>({
      id: r.id,
      studentName: r.student_name,
      studentEmail: r.student_email,
      score: r.score,
      total: r.total,
      percentage: r.percentage,
      passed: r.passed,
      category: r.category,
      categoryScores: r.category_scores,
      createdAt: r.created_at
    }));
    setResults(mapped);
  };

  useEffect(()=>{ load(); loadResults(); },[]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    if(file.size > 5*1024*1024){ alert("File too big - max 5MB"); return; }
    setUploading(true); setUploadProgress("Uploading to Supabase...");
    try {
      const fileName = `${form.category || 'general'}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`;
      const { error } = await supabase.storage.from('traffic-signs').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if(error){ alert("Upload failed: " + error.message); setUploadProgress(""); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('traffic-signs').getPublicUrl(fileName);
      setForm(prev => ({...prev, imageUrl: urlData.publicUrl}));
      setUploadProgress("Uploaded ✓"); setTimeout(()=>setUploadProgress(""), 2000);
    } catch(err:any){ alert("Upload error: " + err.message); } finally { setUploading(false); if(fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const filtered = questions.filter(q => {
    const s = search.toLowerCase();
    const matchesSearch = q.question.toLowerCase().includes(s) || (q.signType||"").toLowerCase().includes(s) || (q.controlType||"").toLowerCase().includes(s);
    const matchesCat = catFilter==="all" || q.category===catFilter;
    return matchesSearch && matchesCat;
  });

  const filteredResults = results.filter(r => {
    const s = resultSearch.toLowerCase();
    return !s || r.studentName.toLowerCase().includes(s) || (r.studentEmail||"").toLowerCase().includes(s);
  });

  const counts = { all: questions.length, rules: questions.filter(q=>q.category==="rules").length, signs: questions.filter(q=>q.category==="signs").length, controls: questions.filter(q=>q.category==="controls").length };
  const resultStats = { total: results.length, passed: results.filter(r=>r.passed).length, failed: results.filter(r=>!r.passed).length, avg: results.length ? Math.round(results.reduce((a,b)=>a+b.percentage,0)/results.length) : 0 };

  const submit = async (e:any) => {
    e.preventDefault();
    const payload = {...form, correct: Number(form.correct)};
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? {id:editingId, ...payload} : payload;
    await fetch("/api/questions", {method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body)});
    setForm({question:"", options:["","","",""], correct:0, category:"rules", imageUrl:"", signType:"", controlType:"", explanation:""});
    setEditingId(null); load();
  };

  const isImageUrl = (url?:string) => url && (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/"));

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <a href="/" className="text-sm px-4 py-2 bg-white rounded-full border">← Home</a>
        <div className="flex gap-2">
          <button onClick={()=>setView("questions")} className={`text-sm px-4 py-2 rounded-full ${view==="questions" ? "bg-[#1a7a3a] text-white" : "bg-white border"}`}>Manage Q's</button>
          <button onClick={()=>{setView("results"); loadResults();}} className={`text-sm px-4 py-2 rounded-full ${view==="results" ? "bg-[#1a7a3a] text-white" : "bg-white border"}`}>Results ({results.length})</button>
          <a href="/student" className="text-sm px-4 py-2 bg-[#1a7a3a] text-white rounded-full">Student View →</a>
        </div>
      </div>
      <div className="bg-white/95 backdrop-blur rounded-[2.5rem] p-8 shadow-[0_25px_40px_-10px_rgba(20,70,35,0.35)]">
        {view === "questions" ? (
          <>
            <h1 className="text-3xl font-bold text-[#123321]">Admin · CRUD v6</h1>
            <p className="text-[#4a7a58] mt-1">Questions + Student Results dashboard</p>
            <div className="mt-6 flex flex-wrap gap-2">{(["all","rules","signs","controls"] as const).map(c=>{ const label = c==="all" ? `All (${counts.all})` : c==="rules" ? `📜 Rules (${counts.rules})` : c==="signs" ? `🚦 Signs (${counts.signs})` : `🚗 Controls (${counts.controls})`; return <button key={c} onClick={()=>setCatFilter(c)} className={`px-4 py-2 rounded-full text-sm font-semibold border ${catFilter===c ? "bg-[#1a7a3a] text-white border-[#1a7a3a]" : "bg-white border-[#cbe4d3]"}`}>{label}</button>})}</div>
            <div className="mt-4 flex gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions..." className="flex-1 border border-[#cbe4d3] bg-[#f3faf5] rounded-full px-5 py-3 outline-none" /><button onClick={load} className="px-5 py-3 rounded-full bg-[#e2f0e6] font-semibold">Refresh</button></div>
            <form onSubmit={submit} className="mt-8 grid gap-5 bg-[#f3faf5] border border-[#cbe4d3] rounded-[1.5rem] p-6">
              <div className="flex gap-2">{(["rules","signs","controls"] as const).map(cat=>(<button key={cat} type="button" onClick={()=>setForm({...form, category:cat})} className={`px-4 py-2 rounded-full text-sm font-semibold border ${form.category===cat ? "bg-[#1a7a3a] text-white" : "bg-white border-[#cbe4d3]"}`}>{cat}</button>))}</div>
              <input required value={form.question||""} onChange={e=>setForm({...form, question:e.target.value})} placeholder="Question text" className="border border-[#cbe4d3] rounded-xl px-4 py-3 bg-white" />
              <div className="bg-white border-2 border-dashed border-[#cbe4d3] rounded-xl p-5">
                <label className="text-sm font-bold block mb-3">📸 Image</label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2"><input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" /><label htmlFor="file-upload" className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer ${uploading ? "bg-gray-100" : "bg-[#e2f0e6] border-[#1a7a3a]"}`}><span>📤</span><span className="font-semibold">{uploading ? "Uploading..." : "Click to Upload"}</span></label>{uploadProgress && <div className="mt-2 text-sm font-semibold text-[#1a7a3a]">{uploadProgress}</div>}</div>
                  <div className="bg-[#f3faf5] rounded-xl border p-3 flex items-center justify-center min-h-">{form.imageUrl ? (isImageUrl(form.imageUrl) ? <img src={form.imageUrl} alt="preview" className="max-h-24 object-contain" /> : <span className="text-5xl">{form.imageUrl}</span>) : <span className="text-sm text-gray-400">Preview</span>}</div>
                </div>
              </div>
              {form.category==="signs" && (<select value={form.signType||""} onChange={e=>setForm({...form, signType:e.target.value})} className="border border-amber-200 rounded-xl px-3 py-3 bg-amber-50"><option value="">Select Sign Type</option>{SIGN_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select>)}
              {form.category==="controls" && (<select value={form.controlType||""} onChange={e=>setForm({...form, controlType:e.target.value})} className="border border-blue-200 rounded-xl px-3 py-3 bg-blue-50"><option value="">Select Control Type</option>{CONTROL_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select>)}
              <input value={form.explanation||""} onChange={e=>setForm({...form, explanation:e.target.value})} placeholder="Explanation (optional)" className="border rounded-xl px-4 py-2 bg-white" />
              <div className="grid grid-cols-2 gap-3">{(form.options as string[]).map((opt,i)=>(<div key={i} className="flex items-center gap-2"><input required value={opt} onChange={e=>{ const o=[...(form.options as string[])]; o[i]=e.target.value; setForm({...form, options:o}); }} placeholder={`Option ${String.fromCharCode(65+i)}`} className="flex-1 border rounded-xl px-3 py-2 bg-white" /><input type="radio" name="correct" checked={form.correct===i} onChange={()=>setForm({...form, correct:i})} className="accent-[#1a7a3a] w-5 h-5" /></div>))}</div>
              <button disabled={uploading} className="bg-[#1a7a3a] text-white rounded-full py-3 font-semibold">{editingId ? "Update" : "Create"} Question</button>
            </form>
            <div className="mt-8 space-y-3">{filtered.map((q, idx)=>(<div key={q.id} className="border bg-white rounded-2xl p-4 flex gap-4"><div className="w-16 h-16 bg-[#f3faf5] rounded-xl flex items-center justify-center overflow-hidden shrink-0">{q.imageUrl ? (isImageUrl(q.imageUrl) ? <img src={q.imageUrl} alt="" className="w-full h-full object-contain"/> : <span className="text-3xl">{q.imageUrl}</span>) : <span>📜</span>}</div><div className="flex-1"><div className="font-semibold">{idx+1}. {q.question}</div><div className="text-sm text-[#5b8a6a] mt-1">Correct: {(Array.isArray(q.options)?q.options:[])[q.correct]} · {q.category}</div></div><div className="flex gap-2 self-start"><button onClick={()=>{ setForm({question:q.question, options:Array.isArray(q.options)?q.options:["","","",""], correct:q.correct, category:q.category, imageUrl:q.imageUrl, signType:q.signType, controlType:q.controlType, explanation:q.explanation}); setEditingId(q.id); window.scrollTo({top:0,behavior:"smooth"});}} className="px-3 py-1 rounded-full bg-[#e2f0e6] text-sm">Edit</button><button onClick={async()=>{ if(confirm("Delete?")){ await fetch(`/api/questions?id=${q.id}`,{method:"DELETE"}); setQs(prev=>prev.filter(p=>p.id!==q.id)); } }} className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm">Delete</button></div></div>))}</div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold">Student Test Results</h1><p className="text-[#4a7a58] mt-1">Live K53 test attempts · Pass is 77%</p></div><button onClick={loadResults} className="px-5 py-2 rounded-full bg-[#e2f0e6] font-semibold">Refresh Results</button></div>
            <div className="mt-6 grid grid-cols-4 gap-3"><div className="bg-[#f3faf5] border rounded-2xl p-4"><div className="text-xs">Total Tests</div><div className="text-2xl font-bold">{resultStats.total}</div></div><div className="bg-green-50 border border-green-200 rounded-2xl p-4"><div className="text-xs text-green-700">Passed</div><div className="text-2xl font-bold text-green-800">{resultStats.passed}</div></div><div className="bg-red-50 border border-red-200 rounded-2xl p-4"><div className="text-xs text-red-700">Failed</div><div className="text-2xl font-bold text-red-800">{resultStats.failed}</div></div><div className="bg-[#f3faf5] border rounded-2xl p-4"><div className="text-xs">Average</div><div className="text-2xl font-bold">{resultStats.avg}%</div></div></div>
            <div className="mt-6 flex gap-2"><input value={resultSearch} onChange={e=>setResultSearch(e.target.value)} placeholder="Search by student name..." className="flex-1 border bg-[#f3faf5] rounded-full px-5 py-3 outline-none" /></div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b"><th className="py-3 px-2">Student</th><th className="py-3 px-2">Score</th><th className="py-3 px-2">%</th><th className="py-3 px-2">Result</th><th className="py-3 px-2">Category</th><th className="py-3 px-2">Date</th></tr></thead>
                <tbody>
                  {filteredResults.map(r=>(
                    <tr key={r.id} className="border-b hover:bg-[#f3faf5]">
                      <td className="py-3 px-2"><div className="font-semibold">{r.studentName}</div><div className="text-xs text-gray-500">{r.studentEmail||""}</div></td>
                      <td className="py-3 px-2 font-mono">{r.score}/{r.total}</td>
                      <td className="py-3 px-2 font-bold">{r.percentage}%</td>
                      <td className="py-3 px-2"><span className={`px-3 py-1 rounded-full text-xs font-bold ${r.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{r.passed ? "PASS" : "FAIL"}</span></td>
                      <td className="py-3 px-2 text-xs">{r.category} · {r.categoryScores ? Object.entries(r.categoryScores).map(([k,v])=>`${k}:${v}`).join(" ") : ""}</td>
                      <td className="py-3 px-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {filteredResults.length===0 && <tr><td colSpan={6} className="py-10 text-center text-gray-400">No results yet - do a test in Student view</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}