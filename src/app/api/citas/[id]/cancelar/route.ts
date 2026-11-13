import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repos = getRepositories();
    const cita = await repos.citas.cancelarConTransaccion(params.id);
    return NextResponse.json({
      success: true,
      message: 'Cita médica cancelada y disponibilidad liberada.',
      cita,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al cancelar la cita médica';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
