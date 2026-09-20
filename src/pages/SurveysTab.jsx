import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

const KINDS = [
  { id: "single", label: "Pick one" },
  { id: "number", label: "Number" },
  { id: "scale", label: "Scale 1–5" },
  { id: "text", label: "Short text" },
];

function Bar({ label, value, max }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-ink-700"><span>{label}</span><span className="font-semibold">{value}</span></div>
      <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-indigo-500" style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div>
    </div>
  );
}

function Results({ id, title, onBack }) {
  const session = auth.getSession();
  const [data, setData] = useState(null);
  useEffect(() => { api.getSurveyResults(session.token, id).then((r) => r.success && setData(r.data)); }, [id, session.token]);
  if (!data) return <p className="text-ink-400">Loading results…</p>;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-indigo-600">← All surveys</button>
        <button onClick={() => api.downloadSurveyCsv(session.token, id, title)} className="ml-auto text-sm border border-slate-200 rounded-lg px-4 py-1.5">Download CSV</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-display text-xl font-semibold text-ink-900">{data.survey.title}</h3>
        <p className="text-sm text-ink-700 mt-1">{data.totalResponses} answers — <b>{data.realResponses} real</b>, {data.demoResponses} demo</p>
        {data.demoResponses > 0 && <p className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">This total includes demo answers created by the seed script. Only the "real" count may be reported as research.</p>}
      </div>
      {data.questions.map((q) => (
        <div key={q.key} className="bg-white rounded-2xl border border-slate-100 p-6">
          <p className="font-medium text-ink-900 mb-3">{q.text} <span className="text-xs text-ink-400">({q.answered} answered)</span></p>
          {q.kind === "single" && Object.entries(q.counts).map(([label, value]) => <Bar key={label} label={label} value={value} max={Math.max(...Object.values(q.counts), 1)} />)}
          {(q.kind === "number" || q.kind === "scale") && (
            <>
              <p className="text-sm text-ink-700">Average <b>{q.mean}{q.unit}</b> · median {q.median} · range {q.min}–{q.max}</p>
              {q.districtMeans.length > 0 && <div className="mt-3"><p className="text-xs text-ink-400 mb-1">Average by district</p>{q.districtMeans.map((d) => <Bar key={d.district} label={`${d.district} (${d.n})`} value={d.mean} max={q.districtMeans[0].mean} />)}</div>}
            </>
          )}
          {q.kind === "text" && (q.samples.length ? <ul className="list-disc pl-5 text-sm text-ink-700 space-y-1">{q.samples.map((s, i) => <li key={i}>{s}</li>)}</ul> : <p className="text-sm text-ink-400">No text answers yet.</p>)}
        </div>
      ))}
    </div>
  );
}

export default function SurveysTab() {
  const session = auth.getSession();
  const [surveys, setSurveys] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [districts, setDistricts] = useState("");
  const [questions, setQuestions] = useState([{ kind: "single", text: "", options: "" }]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const r = await api.getSurveys(session.token);
    if (r.success) setSurveys(r.data);
  }, [session.token]);
  useEffect(() => { load(); }, [load]);

  function setQ(i, patch) { setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q))); }

  async function create() {
    setError("");
    const body = {
      title, intro,
      audienceDistricts: districts.split(",").map((s) => s.trim()).filter(Boolean),
      questions: questions.map((q) => ({ kind: q.kind, text: q.text, ...(q.kind === "single" ? { options: q.options.split(",").map((s) => s.trim()).filter(Boolean) } : {}) })),
    };
    const r = await api.createSurvey(session.token, body);
    if (r.success) { setCreating(false); setTitle(""); setIntro(""); setQuestions([{ kind: "single", text: "", options: "" }]); load(); }
    else setError(r.message || "Could not create the survey.");
  }

  if (viewing) return <Results id={viewing.id} title={viewing.title} onBack={() => setViewing(null)} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setCreating(!creating)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium">{creating ? "Close" : "New survey"}</button></div>

      {creating && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Survey title" className="w-full px-4 py-2.5 rounded-lg border border-slate-200" />
          <input value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="One-line intro (optional)" className="w-full px-4 py-2.5 rounded-lg border border-slate-200" />
          <input value={districts} onChange={(e) => setDistricts(e.target.value)} placeholder="Only these districts (comma-separated, empty = everyone)" className="w-full px-4 py-2.5 rounded-lg border border-slate-200" />
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
              <div className="flex gap-2">
                <select value={q.kind} onChange={(e) => setQ(i, { kind: e.target.value })} className="px-2 py-2 rounded-lg border border-slate-200 text-sm">{KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</select>
                <input value={q.text} onChange={(e) => setQ(i, { text: e.target.value })} placeholder={`Question ${i + 1}`} className="flex-1 px-3 py-2 rounded-lg border border-slate-200" />
                {questions.length > 1 && <button onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">Remove</button>}
              </div>
              {q.kind === "single" && <input value={q.options} onChange={(e) => setQ(i, { options: e.target.value })} placeholder="Options, comma-separated (2–8)" className="w-full px-3 py-2 rounded-lg border border-slate-200" />}
            </div>
          ))}
          {questions.length < 8 && <button onClick={() => setQuestions([...questions, { kind: "single", text: "", options: "" }])} className="text-sm text-indigo-600">+ Add question</button>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button onClick={create} className="bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium">Publish to farmers</button>
        </div>
      )}

      {surveys.length === 0 && !creating && <p className="text-ink-400">No surveys yet. Create one and farmers will see it in the app.</p>}
      {surveys.map((s) => (
        <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-ink-900">{s.title}</p>
            <p className="text-sm text-ink-400">{s.questions.length} questions · {s.responses} answers · {s.isActive ? "open" : "closed"}</p>
          </div>
          <button onClick={() => setViewing({ id: s.id, title: s.title })} className="text-sm border border-slate-200 rounded-lg px-4 py-1.5">Results</button>
          <button onClick={async () => { await api.setSurveyActive(session.token, s.id, !s.isActive); load(); }} className="text-sm text-ink-700">{s.isActive ? "Close" : "Reopen"}</button>
        </div>
      ))}
    </div>
  );
}
