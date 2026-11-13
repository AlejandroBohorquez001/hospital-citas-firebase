import { IRepositoryContainer } from './interfaces';
import { PrismaMedicoRepository } from './prisma/prisma-medico.repository';
import { PrismaPacienteRepository } from './prisma/prisma-paciente.repository';
import { PrismaHorarioRepository } from './prisma/prisma-horario.repository';
import { PrismaDisponibilidadRepository } from './prisma/prisma-disponibilidad.repository';
import { PrismaCitaRepository } from './prisma/prisma-cita.repository';
import { PrismaDashboardRepository } from './prisma/prisma-dashboard.repository';

import { FirestoreMedicoRepository } from './firestore/firestore-medico.repository';
import { FirestorePacienteRepository } from './firestore/firestore-paciente.repository';
import { FirestoreHorarioRepository } from './firestore/firestore-horario.repository';
import { FirestoreDisponibilidadRepository } from './firestore/firestore-disponibilidad.repository';
import { FirestoreCitaRepository } from './firestore/firestore-cita.repository';
import { FirestoreDashboardRepository } from './firestore/firestore-dashboard.repository';

import { createMemoryContainer } from './memory/memory-container';

class RepositoryManager {
  private static instance: RepositoryManager;
  private prismaContainer?: IRepositoryContainer;
  private firestoreContainer?: IRepositoryContainer;
  private memoryContainer?: IRepositoryContainer;

  private constructor() {}

  public static getInstance(): RepositoryManager {
    if (!RepositoryManager.instance) {
      RepositoryManager.instance = new RepositoryManager();
    }
    return RepositoryManager.instance;
  }

  public getContainer(): IRepositoryContainer {
    const provider = (process.env.DB_PROVIDER || 'postgres').toLowerCase();

    if (provider === 'firestore') {
      if (!this.firestoreContainer) {
        this.firestoreContainer = {
          medicos: new FirestoreMedicoRepository(),
          pacientes: new FirestorePacienteRepository(),
          horarios: new FirestoreHorarioRepository(),
          disponibilidades: new FirestoreDisponibilidadRepository(),
          citas: new FirestoreCitaRepository(),
          dashboard: new FirestoreDashboardRepository(),
        };
      }
      return this.firestoreContainer;
    }

    if (provider === 'memory') {
      if (!this.memoryContainer) {
        this.memoryContainer = createMemoryContainer();
      }
      return this.memoryContainer;
    }

    // Por defecto: PostgreSQL con Prisma
    if (!this.prismaContainer) {
      this.prismaContainer = {
        medicos: new PrismaMedicoRepository(),
        pacientes: new PrismaPacienteRepository(),
        horarios: new PrismaHorarioRepository(),
        disponibilidades: new PrismaDisponibilidadRepository(),
        citas: new PrismaCitaRepository(),
        dashboard: new PrismaDashboardRepository(),
      };
    }
    return this.prismaContainer;
  }
}

export const getRepositories = (): IRepositoryContainer => {
  return RepositoryManager.getInstance().getContainer();
};

export const getCurrentProvider = (): 'postgres' | 'firestore' | 'memory' => {
  const p = (process.env.DB_PROVIDER || 'postgres').toLowerCase();
  if (p === 'firestore') return 'firestore';
  if (p === 'memory') return 'memory';
  return 'postgres';
};

export * from './interfaces';
