import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const startTime = Date.now();
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('fests')
      .select('*', { count: 'exact', head: true });

    const latencyMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        { status: 'degraded', error: error.message, latencyMs },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: 'healthy', database: 'connected', festCount: count || 0, latencyMs, timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err?.message || 'Health check failed' },
      { status: 500 }
    );
  }
}
