"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Question = { 
  id: string; 
  question: string; 
  options: any; 
  correct: number; 
  category: "rules" | "signs" | "controls";
  imageUrl?: string;
  signType?: string;
  controlType?: string;
  explanation?: string;
};

export default function StudentPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<"all"|"rules"|"signs"|"controls">("all");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [started, setStarted] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(()=>{
    fetch("/api/questions").then(r=>r.json()).then(setQuestions).catch(()=>{});
    const n = localStorage.getItem("k53_name"); if(n) setStudentName(n);
    const e = localStorage.getItem("k53_email"); if(e) setStudentEmail(e);
  },[]);

  const filtered = filter==="all" ? questions : questions.filter(q=>q.category===filter);
  const q = filtered[current];
  const score = Object.entries(answers).filter(([idx, ans]) => filtered[Number(idx)]?.correct === ans).length;
  const percent = filtered.length ? Math.round((score / filtered.length) * 100) : 0;
  const passed = percent >= 77;

  const saveToSupabase = async () => {
    if(saving || saved) return;
    if(!studentName.trim()){ alert("Enter name"); return; }
    setSaving(true);
    try {
      localStorage.setItem("k53_name", studentName);
      localStorage.setItem("k53_email", studentEmail);
      const { error } = await supabase.from("test_results").insert({
        student_name: studentName.trim(),
        student_email: studentEmail.trim() || null,
        score,
        total: filtered.length,
        percentage: percent,
        passed,
        category: filter,
        category_scores: {
          rules: filtered.filter((_,i)=> filtered[i].category==="rules" && answers[i]===filtered[i].correct).length,
          signs: filtered.filter((_,i)=> filtered[i].category==="signs" && answers[i]===filtered[i].correct).length,
          controls: filtered.filter((_,i)=> filtered[i].category==="controls" && answers[i]===filtered[i].correct).length,
        }
      });
      if(error) throw error;
      setSaved(true);
    } catch(e:any){
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(()=>{ if(showResult && !saved && studentName) saveToSupabase(); },[showResult]);

  if(!started){
    return (
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between mb-4"><a href="/" className="px-4 py-2 bg-white rounded-full border">← Home</a><a href="/admin" className="px-4 py-2 bg-white rounded-full border">Admin →</a></div>
        <div className="bg-white rounded-[2.5rem] p-10 shadow text-center">
          <h1 className="text-4xl font-black">Learner Test</h1>
          <div className="mt-6 max-w-sm mx-auto grid gap-2 text-left bg-[#f3faf5] border rounded-2xl p-5">
            <input value={studentName} onChange={e=>setStudentName(e.target.value)} placeholder="Your full name *" className="border rounded-xl px-4 py-3" />
            <input value={studentEmail} onChange={e=>setStudentEmail(e.target.value)} placeholder="Email (optional)" className="border rounded-xl px-4 py-3" />
          </div>
          <div className="mt-6 flex justify-center gap-2">{(["all","rules","signs","controls"] as const).map(c=><button key={c} onClick={()=>setFilter(c)} className={`px-4 py-2 rounded-full border text-sm ${filter===c?"bg-[#1a7a3a] text-white":"bg-white"}`}>{c} ({c==="all"?questions.length:questions.filter(x=>x.category===c).length})</button>)}</div>
          <button disabled={!studentName.trim() || filtered.length===0} onClick={()=>{setStarted(true);setCurrent(0);setAnswers({});setShowResult(false);setSaved(false)}} className="mt-6 px-10 py-4 bg-[#1a7a3a] text-white rounded-full font-bold disabled:opacity-50">Start Test ({filtered.length})</button>
        </div>
      </main>
    )
  }

  if(showResult){
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-[2.5rem] p-10 shadow text-center">
          <h1 className={`text-4xl font-black ${passed?"text-green-600":"text-red-600"}`}>{passed?"PASSED!":"FAILED"}</h1>
          <div className="text-5xl font-black mt-4">{percent}%</div>
          <p className="mt-2">{score}/{filtered.length} correct</p>
          <div className="mt-4">{saving?<span className="px-4 py-2 bg-amber-100 rounded-full text-sm">Saving...</span>:saved?<span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">✓ Saved! Admin can see it now</span>:<button onClick={saveToSupabase} className="px-6 py-2 bg-[#1a7a3a] text-white rounded-full">Save Result</button>}</div>
          <div className="mt-8 flex justify-center gap-3"><button onClick={()=>{setStarted(false);setShowResult(false);setSaved(false)}} className="px-6 py-3 rounded-full border">Categories</button><button onClick={()=>{setCurrent(0);setAnswers({});setShowResult(false);setSaved(false)}} className="px-6 py-3 rounded-full bg-[#1a7a3a] text-white">Retake</button></div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded- p-8 shadow">
        <h2 className="text-xl font-bold">{current+1}. {q?.question}</h2>
        <div className="mt-6 grid gap-3">{q?.options?.map((opt:string, idx:number)=><button key={idx} onClick={()=>setAnswers({...answers,[current]:idx})} className={`p-4 rounded-2xl border-2 text-left ${answers[current]===idx?"bg-[#1a7a3a] text-white":"bg-white"}`}>{String.fromCharCode(65+idx)}. {opt}</button>)}</div>
        <div className="mt-6 flex justify-between"><button disabled={current===0} onClick={()=>setCurrent(c=>c-1)} className="px-6 py-3 rounded-full border disabled:opacity-30">Back</button>{current<filtered.length-1?<button onClick={()=>setCurrent(c=>c+1)} className="px-6 py-3 rounded-full bg-black text-white">Next</button>:<button onClick={()=>setShowResult(true)} className="px-6 py-3 rounded-full bg-[#1a7a3a] text-white">Submit</button>}</div>
      </div>
    </main>
  )
}