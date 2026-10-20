"use client";
import React, { useState, useEffect } from "react";
import ConnectorIcon from "./ConnectorIcon";
import {
  ALL_CONNECTOR_APPS,
  CONNECTOR_STATS,
  searchApps,
  getToolsForConnector,
  type ConnectorApp,
  type ConnectorTool,
} from "@/lib/connectorsData";
import {
  directConnectProvider,
  disconnectProvider,
  getProviderTools,
  updateEnabledTools,
  getConnectedIntegrations,
} from "@/lib/connectors";

interface ConnectorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectorsModal({ isOpen, onClose }: ConnectorsModalProps) {
  // Connector catalog state
  const [connectors, setConnectors] = useState<ConnectorApp[]>(ALL_CONNECTOR_APPS);
  const [selectedConnector, setSelectedConnector] = useState<ConnectorApp>(ALL_CONNECTOR_APPS[0]);
  const [activeTab, setActiveTab] = useState<"connected" | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Tools state for selected connector
  const [currentTools, setCurrentTools] = useState<ConnectorTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Connection dialog modals (Screenshots 3 & 4)
  const [showConfigModal, setShowConfigModal] = useState(false); // Base URL modal (Supabase)
  const [baseUrlInput, setBaseUrlInput] = useState("https://api.supabase.com");
  const [showOAuthModal, setShowOAuthModal] = useState(false); // Google/Composio OAuth modal (Google Docs)
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  // Sync connected integrations from backend on mount/open
  useEffect(() => {
    if (!isOpen) return;

    const syncIntegrations = async () => {
      try {
        const backendConnected = await getConnectedIntegrations();
        if (backendConnected && backendConnected.length > 0) {
          const connectedMap = new Map<string, { enabled_count: number; total_tools: number }>();
          backendConnected.forEach((integ: any) => {
            connectedMap.set(integ.provider.toLowerCase(), {
              enabled_count: integ.enabled_tools,
              total_tools: integ.total_tools,
            });
          });

          setConnectors((prev) =>
            prev.map((app) => {
              const normId = app.id.toLowerCase().replace(/[^a-z0-9]/g, "");
              const match = connectedMap.get(normId);
              if (match) {
                return {
                  ...app,
                  connected: true,
                  toolCount: match.enabled_count > 0 ? match.enabled_count : app.toolCount,
                };
              }
              return app;
            })
          );
        }
      } catch (err) {
        console.warn("Could not sync backend integrations:", err);
      }
    };

    syncIntegrations();
  }, [isOpen]);

  // Load tools whenever selected connector changes
  useEffect(() => {
    if (!selectedConnector) return;

    const loadTools = async () => {
      setLoadingTools(true);
      try {
        // Try backend first
        const backendTools = await getProviderTools(selectedConnector.id);
        if (backendTools && backendTools.length > 0) {
          setCurrentTools(backendTools);
        } else {
          // Fallback to rich local tools catalog
          const localTools = getToolsForConnector(selectedConnector.id);
          setCurrentTools(localTools);
        }
      } catch {
        const localTools = getToolsForConnector(selectedConnector.id);
        setCurrentTools(localTools);
      } finally {
        setLoadingTools(false);
      }
    };

    loadTools();
  }, [selectedConnector?.id]);

  if (!isOpen) return null;

  // Counts
  const connectedApps = connectors.filter((c) => c.connected);
  const connectedCount = connectedApps.length;
  const totalCount = connectors.length;

  // Filtered list
  const filteredList = connectors.filter((app) => {
    const matchesTab = activeTab === "all" || (activeTab === "connected" && app.connected);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  // Calculate enabled count
  const enabledToolsCount = currentTools.filter((t) => t.enabled).length;
  const totalToolsCount = currentTools.length;

  // Click Connect on Header
  const handleOpenConnect = () => {
    const norm = selectedConnector.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    setConnectingProvider(selectedConnector.id);

    // If Supabase or API key service -> Open Base URL modal (Screenshot 3)
    if (norm === "supabase") {
      setBaseUrlInput("https://api.supabase.com");
      setShowConfigModal(true);
    } else {
      // Open OAuth Modal (Screenshot 4)
      setShowOAuthModal(true);
    }
  };

  // Perform Connection (called by either Base URL modal or OAuth modal)
  const handleConfirmConnect = async (options?: { baseUrl?: string }) => {
    const providerId = selectedConnector.id;
    try {
      const res = await directConnectProvider(providerId, {
        baseUrl: options?.baseUrl,
        accountEmail: "mohdabrarbaloch@gmail.com",
      });

      // Update state
      const initialTools = getToolsForConnector(providerId);
      const enabledCount = initialTools.filter((t) => t.enabled).length;

      setConnectors((prev) =>
        prev.map((app) =>
          app.id === providerId
            ? { ...app, connected: true, toolCount: enabledCount }
            : app
        )
      );

      setSelectedConnector((prev) => ({
        ...prev,
        connected: true,
        toolCount: enabledCount,
      }));

      setCurrentTools(initialTools);
    } catch (err) {
      console.error("Connect error:", err);
    } finally {
      setShowConfigModal(false);
      setShowOAuthModal(false);
      setConnectingProvider(null);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    const providerId = selectedConnector.id;
    try {
      await disconnectProvider(providerId);

      setConnectors((prev) =>
        prev.map((app) =>
          app.id === providerId
            ? { ...app, connected: false }
            : app
        )
      );

      setSelectedConnector((prev) => ({
        ...prev,
        connected: false,
      }));

      // Uncheck tools
      setCurrentTools((prev) => prev.map((t) => ({ ...t, enabled: false })));
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  // Toggle single tool
  const handleToggleTool = (toolId: string) => {
    setCurrentTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  // Toggle all tools
  const handleToggleAll = () => {
    const allEnabled = currentTools.every((t) => t.enabled);
    setCurrentTools((prev) => prev.map((t) => ({ ...t, enabled: !allEnabled })));
  };

  // Save changes (Done button)
  const handleSaveDone = async () => {
    setIsSaving(true);
    try {
      const enabledIds = currentTools.filter((t) => t.enabled).map((t) => t.id);
      await updateEnabledTools(selectedConnector.id, enabledIds);

      // Update left sidebar toolCount badge
      setConnectors((prev) =>
        prev.map((app) =>
          app.id === selectedConnector.id
            ? { ...app, toolCount: enabledIds.length }
            : app
        )
      );
      setSelectedConnector((prev) => ({
        ...prev,
        toolCount: enabledIds.length,
      }));

      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 2000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Box */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[88vh] flex overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= LEFT SIDEBAR (1500+ CONNECTORS) ================= */}
        <div className="w-84 min-w-[320px] max-w-[340px] border-r border-gray-100 flex flex-col bg-white">
          {/* Header */}
          <div className="p-5 pb-3 border-b border-gray-100">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Connectors</h2>
              <span className="text-xs text-gray-400 font-medium">
                {connectedCount} connected · {totalCount} total
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Connect apps to extend your agent.</p>

            {/* Search Input */}
            <div className="relative mt-3">
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all bg-white">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search connectors..."
                  className="w-full text-xs text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 text-xs">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Pill Tabs: Connected (X) | All */}
            <div className="flex bg-gray-100/90 rounded-full p-1 mt-3 gap-1">
              <button
                onClick={() => setActiveTab("connected")}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "connected"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Connected ({connectedCount})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Connectors List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 divide-y-0">
            {filteredList.map((connector) => {
              const isSelected = selectedConnector?.id === connector.id;
              return (
                <button
                  key={connector.id}
                  onClick={() => setSelectedConnector(connector)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group ${
                    isSelected
                      ? "bg-gray-100/80 shadow-sm"
                      : "hover:bg-gray-50/90"
                  }`}
                >
                  {/* Brand Vector Icon */}
                  <ConnectorIcon id={connector.id} name={connector.name} size={32} />

                  {/* Name & Subtitle */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {connector.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {connector.description}
                    </p>
                  </div>

                  {/* Enabled Count Badge & Arrow */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {connector.connected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {connector.toolCount || 1}
                      </span>
                    )}
                    <span className="text-gray-300 text-xs font-semibold group-hover:text-gray-400">
                      &gt;
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredList.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400">
                No connectors found matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT DETAIL & TOOLS PANEL ================= */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Top Header */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
            <div className="flex items-start gap-4 max-w-2xl">
              <ConnectorIcon id={selectedConnector.id} name={selectedConnector.name} size={44} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {selectedConnector.name}
                </h1>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-xl">
                  {selectedConnector.description}
                </p>
              </div>
            </div>

            {/* Actions: Connect / Disconnect + Close Button */}
            <div className="flex items-center gap-3 shrink-0">
              {selectedConnector.connected ? (
                <button
                  onClick={handleDisconnect}
                  className="px-5 py-1.5 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-xs transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleOpenConnect}
                  className="px-6 py-2 rounded-full bg-[#00D35A] hover:bg-[#00b84e] text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
                >
                  Connect
                </button>
              )}

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ================= UNCONNECTED EMPTY STATE (Image 1 & 2) ================= */}
          {!selectedConnector.connected && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
              {/* Electric Plug Icon inside circle (Image 2) */}
              <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-5 text-gray-400">
                <svg className="w-9 h-9 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22v-5" />
                  <path d="M9 8V2" />
                  <path d="M15 2v6" />
                  <path d="M18 8v5a6 6 0 0 1-12 0V8z" />
                </svg>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Connect {selectedConnector.name} to enable its tools
              </h3>
              <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                Tap Connect above to link your account, then choose which tools this agent can use.
              </p>
            </div>
          )}

          {/* ================= CONNECTED TOOLS STATE (Image 5) ================= */}
          {selectedConnector.connected && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Available Tools Subheader */}
              <div className="px-8 pt-6 pb-4 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">Available tools</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {enabledToolsCount} of {totalToolsCount} enabled
                  </p>
                </div>

                <button
                  onClick={handleToggleAll}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  {currentTools.every((t) => t.enabled) ? "Disable all" : "Enable all"}
                </button>
              </div>

              {/* 2-Column Tools Grid */}
              <div className="flex-1 overflow-y-auto px-8 pb-4">
                {loadingTools ? (
                  <div className="py-20 text-center text-xs text-gray-400">Loading tools...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {currentTools.map((tool) => {
                      return (
                        <div
                          key={tool.id}
                          onClick={() => handleToggleTool(tool.id)}
                          className={`rounded-2xl p-4 transition-all cursor-pointer select-none border text-left flex flex-col justify-between ${
                            tool.enabled
                              ? "border-emerald-500 bg-white ring-1 ring-emerald-500/20 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div>
                            {/* Checkmark and Title Row */}
                            <div className="flex items-start gap-3">
                              {tool.enabled ? (
                                <div className="w-5 h-5 rounded-full bg-[#00D35A] flex items-center justify-center text-white shrink-0 mt-0.5">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                              )}

                              <h4 className="font-bold text-sm text-gray-900 leading-snug">
                                {tool.name}
                              </h4>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed pl-8">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Footer (Sticky) */}
              <div className="px-8 py-3.5 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400">
                    Changes are saved when you click Done.
                  </p>
                  {saveSuccessMsg && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md animate-in fade-in">
                      ✓ Saved to backend!
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSaveDone}
                  disabled={isSaving}
                  className="bg-[#00D35A] hover:bg-[#00b84e] text-white px-7 py-2 rounded-full font-semibold text-sm shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Done"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: CONNECT BASE URL (Supabase - Image 3) ================= */}
      {showConfigModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfigModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-gray-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900">
              Connect • {selectedConnector.name}
            </h3>

            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Base URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                The web address for the Supabase Management API. Most accounts can keep the default
                https://api.supabase.com — change it only if you self-host Supabase.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmConnect({ baseUrl: baseUrlInput })}
                className="px-6 py-2 rounded-xl bg-[#00D35A] hover:bg-[#00b84e] text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: OAUTH SIGN-IN (Google Docs/Gmail/etc. - Image 4) ================= */}
      {showOAuthModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowOAuthModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fake Chrome / OAuth Header */}
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
                <span className="ml-2 font-medium text-gray-700">Sign in with Google</span>
              </div>
              <span className="text-[10px] text-gray-400">accounts.google.com</span>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Composio / Abrazy Badge */}
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white mb-6">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M7 8h10M7 12h10M7 16h6" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                You&apos;re signing back in to Composio
              </h2>

              <p className="text-xs text-gray-600 mt-4 leading-relaxed">
                Review Composio&apos;s <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span> and{" "}
                <span className="text-blue-600 underline cursor-pointer">Terms of Service</span> to understand how Composio will process and protect your data.
              </p>

              <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                To make changes at any time, go to your <span className="text-blue-600 underline cursor-pointer">Google Account</span>.
              </p>

              {/* Account Selector Card */}
              <div className="mt-6 p-3 rounded-2xl border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <span className="text-xs font-semibold text-gray-800">
                    mohdabrarbaloch@gmail.com
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowOAuthModal(false)}
                  className="px-6 py-2 rounded-full border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmConnect()}
                  className="px-7 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>English (United States)</span>
              <div className="flex gap-4">
                <span className="hover:underline cursor-pointer">Help</span>
                <span className="hover:underline cursor-pointer">Privacy</span>
                <span className="hover:underline cursor-pointer">Terms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
