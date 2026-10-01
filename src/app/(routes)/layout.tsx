import { Navbar } from '@/components/layout/Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-8 border-t border-border bg-card/30 text-center text-sm text-muted-foreground mt-auto">
        <p>&copy; 2026 VERVE26 — College Event Registration Platform.</p>
        <p className="mt-2 text-primary font-medium">Ideas • Innovation • Impact</p>
      </footer>
    </div>
  );
}
