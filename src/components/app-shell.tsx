import type { ReactNode } from "react";
import { AppSidebar, MobileNav } from "./app-sidebar";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({ title, subtitle, action, children }: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {action}
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 pb-28 md:pb-12">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
