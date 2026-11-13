import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repos = getRepositories();
    const paciente = await repos.pacientes.findById(params.id);
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }
    return NextResponse.json(paciente);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al consultar paciente';
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
    const paciente = await repos.pacientes.update(params.id, body);
    return NextResponse.json(paciente);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar paciente';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repos = getRepositories();
    await repos.pacientes.delete(params.id);
    return NextResponse.json({ success: true, message: 'Paciente eliminado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar paciente';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
