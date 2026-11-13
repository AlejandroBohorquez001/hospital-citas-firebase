import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repos = getRepositories();
    const cita = await repos.citas.marcarAtendida(params.id);
    return NextResponse.json({
      success: true,
      message: 'Cita médica marcada como atendida.',
      cita,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al marcar cita como atendida';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
