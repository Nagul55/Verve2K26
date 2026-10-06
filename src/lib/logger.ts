export async function measurePerf<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const isPerfEnabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_PERF_LOGS === 'true';
  if (!isPerfEnabled) {
    return fn();
  }

  const start = performance.now();
  try {
    const result = await fn();
    const duration = (performance.now() - start).toFixed(2);
    console.log(`[PERF] ${name} executed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = (performance.now() - start).toFixed(2);
    console.error(`[PERF-ERROR] ${name} failed after ${duration}ms`, error);
    throw error;
  }
}
