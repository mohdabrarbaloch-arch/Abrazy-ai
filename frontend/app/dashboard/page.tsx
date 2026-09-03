"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function DashboardPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tool, setTool] = useState("web_search");

  async function load() {
    try {
      setAgents(await api.listAgents());
      setTasks(await api.listTasks());
    } catch {}
  }
  useEffect(() => { load(); }, []);

  async function makeAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createAgent({ name, description: desc, tools: [tool] });
    setName(""); setDesc("");
    load();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Agents</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((a) => (
            <div key={a.id} className="bg-white rounded-lg border border-[#e9edef] p-4 shadow-sm">
              <div className="font-semibold">{a.name}</div>
              <p className="text-sm text-muted mt-1 line-clamp-2">{a.description}</p>
              <div className="text-xs text-muted mt-2">model: {a.model}</div>
              <div className="text-xs text-brand mt-1">{a.tools?.join(", ")}</div>
            </div>
          ))}
        </div>
        <form onSubmit={makeAgent} className="bg-white rounded-lg border p-4 mt-4 space-y-2">
          <div className="font-medium text-sm">Create agent</div>
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <select className="input" value={tool} onChange={(e) => setTool(e.target.value)}>
            {["web_search", "image_generate", "send_email", "post_slack", "notion_write"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <button className="bg-brand text-white rounded-lg px-4 py-2 text-sm">Create</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Tasks</h2>
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="bg-white rounded-lg border p-3 flex justify-between text-sm">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-muted text-xs">{t.trigger}{t.cron ? ` · ${t.cron}` : ""}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${t.status === "success" ? "bg-green-100 text-green-700" : t.status === "failed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                {t.status}
              </span>
            </div>
          ))}
          {tasks.length === 0 && <div className="text-muted text-sm">No tasks yet.</div>}
        </div>
      </section>
      <style>{`.input{border:1px solid #e9edef;border-radius:8px;padding:8px 12px;width:100%;font-size:14px;outline:none}.input:focus{border-color:#00a884}`}</style>
    </div>
  );
}
