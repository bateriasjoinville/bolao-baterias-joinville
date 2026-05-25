import { type ReactNode } from "react";

import { DashboardFooter } from "@/components/dashboard/footer";
import { BottomTabBar } from "@/components/shared/bottom-tab-bar";

export default function AuthedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white pb-14 shadow-xl">
        {children}
        <div className="h-10" />
        <DashboardFooter />
      </main>
      <BottomTabBar />
    </div>
  );
}
