import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Trophy, Users, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          Registrations are now Open
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          VERVE<span className="text-primary">26</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-light text-muted-foreground mb-12 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          IDEAS &bull; INNOVATION &bull; IMPACT
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Button size="lg" className="rounded-full px-8 text-lg font-bold h-14" asChild>
            <Link href="/register">
              Register Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-14" asChild>
            <Link href="/events">Explore Events</Link>
          </Button>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="py-12 border-y border-border/50 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-primary">8</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Major Events</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-primary">1000+</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Participants</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-primary">2</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Days of Tech</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-primary">₹50k</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Prize Pool</p>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS SHOWCASE */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Unleash Your Potential</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Compete in high-stakes technical challenges or unwind with our massive non-technical events.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Tech Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
            <div className="mb-6 inline-flex p-4 rounded-2xl bg-primary/10 text-primary">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Technical Events</h3>
            <p className="text-muted-foreground mb-8">4 intense competitions including our flagship 24-hour Code Marathon, AI Showcases, and Web Wizardry.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-sm"><ArrowRight className="h-4 w-4 mr-2 text-primary" /> Competitive Coding</li>
              <li className="flex items-center text-sm"><ArrowRight className="h-4 w-4 mr-2 text-primary" /> Algorithm Debugging</li>
              <li className="flex items-center text-sm"><ArrowRight className="h-4 w-4 mr-2 text-primary" /> AI/ML Showcases</li>
            </ul>
            <Button variant="outline" className="w-full rounded-full" asChild>
              <Link href="/events#technical">View Tech Events</Link>
            </Button>
          </div>

          {/* Non-Tech Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
            <div className="mb-6 inline-flex p-4 rounded-2xl bg-primary/10 text-primary">
              <Trophy className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Non-Technical Events</h3>
            <p className="text-muted-foreground mb-8">4 exhilarating activities from Valorant Championships to a massive Campus Treasure Hunt.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-sm"><ArrowRight className="h-4 w-4 mr-2 text-primary" /> E-Sports Tournaments</li>
              <li className="flex items-center text-sm"><ArrowRight className="h-4 w-4 mr-2 text-primary" /> Escape Rooms</li>
              <li className="flex items-center text-sm"><ArrowRight className="h-4 w-4 mr-2 text-primary" /> Photography Contests</li>
            </ul>
            <Button variant="outline" className="w-full rounded-full" asChild>
              <Link href="/events#non-technical">View Non-Tech Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
