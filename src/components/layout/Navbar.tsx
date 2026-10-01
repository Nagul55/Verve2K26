import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-primary">VERVE26</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
          <Link href="/guidelines" className="hover:text-primary transition-colors">Guidelines</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild className="font-bold rounded-full px-6">
            <Link href="/register">Register Now</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
