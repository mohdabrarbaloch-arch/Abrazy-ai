"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const PROVIDERS = ["gmail", "slack", "notion", "github"];

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState("");

  async function load() {
    try { setIntegrations(await api.listIntegrations()); } catch {}
    try { setKeys(await api.listKeys()); } catch {}
  }
  useEffect(() => { load(); }, []);

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

      <section>
        <h2 className="text-xl font-semibold mb-3">API Keys</h2>
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
