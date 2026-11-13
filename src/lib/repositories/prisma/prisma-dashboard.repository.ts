import { prisma } from '@/lib/prisma';
import { IDashboardRepository } from '../interfaces';
import { DashboardMetricasDTO, Cita } from '@/types';

export class PrismaDashboardRepository implements IDashboardRepository {
  async getMetricas(): Promise<DashboardMetricasDTO> {
    const today = new Date().toISOString().split('T')[0];

    const [
      citasHoy,
      disponibilidadesLibres,
      totalMedicos,
      totalPacientes,
      proximasCitasRaw,
      todasLasCitas,
    ] = await Promise.all([
      prisma.cita.count({
        where: {
          horario: { fecha: today },
          estado: { not: 'cancelada' },
        },
      }),
      prisma.disponibilidad.count({
        where: {
          estado: 0,
        },
      }),
      prisma.medico.count(),
      prisma.paciente.count(),
      prisma.cita.findMany({
        where: {
          estado: 'programada',
        },
        include: {
          paciente: true,
          medico: true,
          horario: true,
        },
        orderBy: [
          { horario: { fecha: 'asc' } },
          { horario: { hora_inicial: 'asc' } },
        ],
        take: 5,
      }),
      prisma.cita.findMany({
        where: {
          estado: { not: 'cancelada' },
        },
        include: {
          medico: {
            select: { especialidad: true },
          },
        },
      }),
    ]);

    // Calcular citas por especialidad
    const conteoEsp: Record<string, number> = {};
    for (const c of todasLasCitas) {
      const esp = c.medico?.especialidad || 'General';
      conteoEsp[esp] = (conteoEsp[esp] || 0) + 1;
    }

    const citasPorEspecialidad = Object.entries(conteoEsp).map(
      ([especialidad, total]) => ({ especialidad, total })
    );

    return {
      citas_hoy: citasHoy,
      disponibilidades_libres: disponibilidadesLibres,
      citas_por_especialidad: citasPorEspecialidad,
      proximas_citas: proximasCitasRaw as unknown as Cita[],
      total_medicos: totalMedicos,
      total_pacientes: totalPacientes,
    };
  }
}
