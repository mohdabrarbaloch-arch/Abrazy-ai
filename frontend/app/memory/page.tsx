"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, Zap, Link2, FileQuestion, Tag } from "lucide-react";
import { API_URL } from "@/lib/config";

// Dynamic import with SSR disabled for force graph
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface MemoryNode {
  id: string;
  title: string;
  category: string;
  color: string;
  size: number;
  content: string;
  created_at: string;
  updated_at: string;
}

interface MemoryLink {
  id: string;
  source: string;
  target: string;
  strength: number;
  label?: string;
}

interface GraphData {
  nodes: MemoryNode[];
  links: MemoryLink[];
  stats: {
    total_nodes: number;
    total_links: number;
    unlinked: number;
  };
}

interface TopicData {
  category: string;
  node_count: number;
  connection_count: number;
}

export default function MemoryPage() {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
    stats: { total_nodes: 0, total_links: 0, unlinked: 0 },
  });
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [onlyConnected, setOnlyConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"highlights" | "updates">("highlights");

  // Fetch graph data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [graphRes, topicsRes] = await Promise.all([
          fetch(`${API_URL}/api/memory/graph`, { headers }),
          fetch(`${API_URL}/api/memory/topics`, { headers }),
        ]);

        if (graphRes.ok) {
          const data = await graphRes.json();
          setGraphData(data);
        }

        if (topicsRes.ok) {
          const data = await topicsRes.json();
          setTopics(data.topics || []);
        }
      } catch (error) {
        console.error("Failed to fetch memory data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(graphData.nodes.map((n) => n.category)));
    return ["All", ...cats.sort()];
  }, [graphData.nodes]);

  // Filter nodes based on search, category, and connection status
  const filteredData = useMemo(() => {
    let nodes = graphData.nodes;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      nodes = nodes.filter((n) => n.category === selectedCategory);
    }

    // Connected nodes filter
    if (onlyConnected) {
      const connectedNodeIds = new Set<string>();
      graphData.links.forEach((link) => {
        connectedNodeIds.add(link.source);
        connectedNodeIds.add(link.target);
      });
      nodes = nodes.filter((n) => connectedNodeIds.has(n.id));
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = graphData.links.filter(
      (l) => nodeIds.has(l.source) && nodeIds.has(l.target)
    );

    return { nodes, links };
  }, [graphData, searchQuery, selectedCategory, onlyConnected]);

  // Node canvas rendering
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const label = node.title;
    const fontSize = 12;
    ctx.font = `${fontSize}px Inter, sans-serif`;

    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size || 5, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || "#3B82F6";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label below node
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#1F2937";
    ctx.fillText(label, node.x, node.y + (node.size || 5) + 4);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Memory Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            Visualize your knowledge graph and connected ideas
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Nodes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {graphData.stats.total_nodes}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Link2 className="w-4 h-4" />
              <span className="text-sm font-medium">Connections</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {graphData.stats.total_links}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FileQuestion className="w-4 h-4" />
              <span className="text-sm font-medium">Unlinked</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {graphData.stats.unlinked}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">Topics</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 mt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={onlyConnected}
                onChange={(e) => setOnlyConnected(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">
              {onlyConnected ? "Showing connected nodes" : "Show all nodes"}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Force-Directed Graph Canvas */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading memory graph...</p>
                  </div>
                </div>
              ) : (
                <ForceGraph2D
                  graphData={filteredData}
                  width={800}
                  height={600}
                  nodeCanvasObject={nodeCanvasObject}
                  nodeLabel={(node: any) => node.title}
                  linkColor={() => "#CBD5E1"}
                  linkWidth={(link: any) => link.strength || 1}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleWidth={2}
                  backgroundColor="#ffffff"
                  cooldownTicks={100}
                  onNodeClick={(node: any) => {
                    console.log("Node clicked:", node);
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("highlights")}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
                    activeTab === "highlights"
                      ? "text-[#00D35A]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  TOPIC HIGHLIGHTS
                  {activeTab === "highlights" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D35A]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("updates")}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
                    activeTab === "updates"
                      ? "text-[#00D35A]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  RECENT UPDATES
                  {activeTab === "updates" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D35A]"></div>
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3 max-h-[550px] overflow-y-auto">
                {activeTab === "highlights" ? (
                  <>
                    {topics.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No topics yet. Start building your knowledge graph!
                      </p>
                    ) : (
                      topics.map((topic) => (
                        <div
                          key={topic.category}
                          className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
                              {topic.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm text-gray-900 mb-1">
                            {topic.category} Collection
                          </h3>
                          <p className="text-xs text-gray-600">
                            {topic.node_count} related page
                            {topic.node_count !== 1 ? "s" : ""} •{" "}
                            {topic.connection_count} Connection
                            {topic.connection_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  <>
                    {graphData.nodes.slice(0, 10).map((node) => (
                      <div
                        key={node.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span
                            className="inline-block px-2 py-1 text-xs font-semibold rounded"
                            style={{
                              backgroundColor: `${node.color}20`,
                              color: node.color,
                            }}
                          >
                            {node.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-1">
                          {node.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          Updated {new Date(node.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
