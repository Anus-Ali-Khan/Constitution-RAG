"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-primary)", overflow: "hidden" }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
      <ChatArea sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} />
    </div>
  );
}
