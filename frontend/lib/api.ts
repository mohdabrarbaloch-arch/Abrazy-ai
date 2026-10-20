import { API_URL } from "../lib/config";

export function token(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  const t = token();
  if (t) headers.set("Authorization", `Bearer ${t}`);
  if (opts.body) headers.set("Content-Type", "application/json");
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // auth
  register: (b: { email: string; password: string; full_name?: string }) => req("/api/auth/register", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) => req<{ access_token: string; refresh_token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(b) }),
  me: () => req("/api/auth/me"),
  updateProfile: (b: any) => req("/api/auth/profile", { method: "PATCH", body: JSON.stringify(b) }),
  sendMagicLink: (b: { email: string }) => req("/api/auth/magic-link", { method: "POST", body: JSON.stringify(b) }),
  verifyMagicLink: (token: string) => req<{ access_token: string; refresh_token: string }>(`/api/auth/magic-link/verify?token=${token}`),
  oauthConnect: (provider: string) => req<{ url: string }>(`/api/auth/oauth/${provider}/connect`),
  oauthCallback: (provider: string, code: string, state?: string) => req<{ access_token: string; refresh_token: string }>(`/api/auth/oauth/${provider}/callback?code=${code}${state ? `&state=${state}` : ""}`),
  // agents
  listAgents: () => req<any[]>("/api/agents"),
  createAgent: (b: any) => req("/api/agents", { method: "POST", body: JSON.stringify(b) }),
  deleteAgent: (id: string) => req(`/api/agents/${id}`, { method: "DELETE" }),
  // tasks
  listTasks: () => req<any[]>("/api/tasks"),
  createTask: (b: any) => req("/api/tasks", { method: "POST", body: JSON.stringify(b) }),
  // integrations
  listIntegrations: () => req<any[]>("/api/integrations"),
  connect: (p: string) => req<{ url: string }>(`/api/integrations/${p}/connect`),
  // keys
  listKeys: () => req<any[]>("/api/api-keys"),
  createKey: (b: any) => req("/api/api-keys", { method: "POST", body: JSON.stringify(b) }),
  // chat (SSE)
  chat: (b: any) => fetch(`${API_URL}/api/tasks/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify(b),
  }),
  // conversations
  listConversations: () => req<any[]>("/api/conversations"),
  createConversation: (b: { title?: string; is_group?: boolean; agent_id?: string; member_agent_ids?: string[] }) => req<any>("/api/conversations", { method: "POST", body: JSON.stringify(b) }),
  getConversation: (id: string) => req<any>(`/api/conversations/${id}`),
  deleteConversation: (id: string) => req(`/api/conversations/${id}`, { method: "DELETE" }),
  listMessages: (conversationId: string) => req<any[]>(`/api/conversations/${conversationId}/messages`),
  createMessage: (conversationId: string, b: { content: string; sender_type?: string; sender_id?: string; sender_name?: string }) => req<any>(`/api/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify(b) }),
  // models
  models: () => req<{ default: string; models: any[] }>("/api/models"),
  // automations
  listAutomations: (category?: string) => req<any[]>(`/api/automations${category ? `?category=${category}` : ""}`),
  createAutomation: (b: any) => req<any>("/api/automations", { method: "POST", body: JSON.stringify(b) }),
  toggleAutomation: (id: string) => req<any>(`/api/automations/${id}/toggle`, { method: "PATCH" }),
  runAutomation: (id: string) => req<any>(`/api/automations/${id}/run`, { method: "POST" }),
  deleteAutomation: (id: string) => req(`/api/automations/${id}`, { method: "DELETE" }),
  // feed
  getFeed: (filter?: string) => req<any[]>(`/api/feed${filter ? `?filter_type=${filter}` : ""}`),
  // ws
  ws: (taskId: string) => {
    const proto = API_URL.startsWith("https") ? "wss" : "ws";
    const base = API_URL.replace(/^https?/, proto);
    return new WebSocket(`${base}/api/ws/tasks/${taskId}?token=${token()}`);
  },
};
