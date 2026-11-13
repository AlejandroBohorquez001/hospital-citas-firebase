import { NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repos = getRepositories();
    const metricas = await repos.dashboard.getMetricas();
    return NextResponse.json(metricas);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener métricas del dashboard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
