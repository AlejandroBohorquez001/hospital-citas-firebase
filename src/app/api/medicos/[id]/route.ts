import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repos = getRepositories();
    const medico = await repos.medicos.findById(params.id);
    if (!medico) {
      return NextResponse.json({ error: 'Médico no encontrado' }, { status: 404 });
    }
    return NextResponse.json(medico);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al consultar médico';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const repos = getRepositories();
    const medico = await repos.medicos.update(params.id, body);
    return NextResponse.json(medico);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar médico';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repos = getRepositories();
    await repos.medicos.delete(params.id);
    return NextResponse.json({ success: true, message: 'Médico eliminado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar médico';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
