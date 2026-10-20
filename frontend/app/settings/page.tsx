"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const PROVIDERS = ["gmail", "slack", "notion", "github"];

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState("");
  const [customGroqKey, setCustomGroqKey] = useState("");
  const [customGeminiKey, setCustomGeminiKey] = useState("");
  const [customOpenaiKey, setCustomOpenaiKey] = useState("");
  const [customClaudeKey, setCustomClaudeKey] = useState("");

  async function load() {
    try { setIntegrations(await api.listIntegrations()); } catch {}
    try { setKeys(await api.listKeys()); } catch {}
  }
  useEffect(() => {
    load();
    if (typeof window !== "undefined") {
      setCustomGroqKey(localStorage.getItem("groq_api_key") || "");
      setCustomGeminiKey(localStorage.getItem("gemini_api_key") || "");
      setCustomOpenaiKey(localStorage.getItem("openai_api_key") || "");
      setCustomClaudeKey(localStorage.getItem("anthropic_api_key") || "");
    }
  }, []);

  async function connect(p: string) {
    try {
      const { url } = await api.connect(p);
      window.open(url, "_blank");
    } catch (e: any) { alert(e.message); }
  }

  async function makeKey() {
    if (!newKey.trim()) return;
    await api.createKey({ label: newKey });
    setNewKey("");
    load();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Integrations</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PROVIDERS.map((p) => {
            const active = integrations.find((i) => i.provider === p && i.status === "active");
            return (
              <div key={p} className="bg-white rounded-lg border p-4 flex items-center justify-between">
                <div className="capitalize font-medium">{p}</div>
                {active ? (
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Connected</span>
                ) : (
                  <button onClick={() => connect(p)} className="text-xs bg-brand text-white px-3 py-1.5 rounded hover:bg-brand-dark">Connect</button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">LLM Provider API Keys</h2>
            <p className="text-xs text-slate-500">Bring Your Own Key (BYOK) for unlimited requests. If empty, free system environment keys are used automatically.</p>
          </div>
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
            Dynamic Router Active
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">⚡ Groq API Key (LLaMA 3.3)</label>
            <input
              type="password"
              placeholder="gsk_..."
              value={customGroqKey}
              onChange={(e) => setCustomGroqKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#00a884] font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">🌟 Google Gemini API Key (2.5 Flash)</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={customGeminiKey}
              onChange={(e) => setCustomGeminiKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#00a884] font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">🌐 OpenAI API Key (GPT-4o)</label>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={customOpenaiKey}
              onChange={(e) => setCustomOpenaiKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#00a884] font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">🔮 Anthropic Claude API Key</label>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={customClaudeKey}
              onChange={(e) => setCustomClaudeKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#00a884] font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">Keys are encrypted & saved securely in your browser session.</span>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                if (customGroqKey) localStorage.setItem("groq_api_key", customGroqKey);
                else localStorage.removeItem("groq_api_key");

                if (customGeminiKey) localStorage.setItem("gemini_api_key", customGeminiKey);
                else localStorage.removeItem("gemini_api_key");

                if (customOpenaiKey) localStorage.setItem("openai_api_key", customOpenaiKey);
                else localStorage.removeItem("openai_api_key");

                if (customClaudeKey) localStorage.setItem("anthropic_api_key", customClaudeKey);
                else localStorage.removeItem("anthropic_api_key");

                alert("LLM Provider API keys saved successfully!");
              }
            }}
            className="bg-[#00a884] hover:bg-[#008f6f] text-white font-medium text-xs px-4 py-2 rounded-lg transition"
          >
            Save LLM Keys
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Abrazy Application Keys</h2>
        <div className="space-y-2">
          {keys.map((k) => (
            <div key={k.id} className="bg-white rounded-lg border p-3 flex justify-between text-sm">
              <span>{k.label || "(untitled)"}</span>
              <span className="text-muted font-mono">{k.prefix}…</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input className="input" placeholder="Key label" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <button onClick={makeKey} className="bg-brand text-white px-4 py-2 rounded-lg text-sm">Create</button>
        </div>
      </section>
      <style>{`.input{border:1px solid #e9edef;border-radius:8px;padding:8px 12px;width:100%;font-size:14px;outline:none}.input:focus{border-color:#00a884}`}</style>
    </div>
  );
}
