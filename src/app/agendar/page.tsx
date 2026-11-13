'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarPlus,
  User,
  Stethoscope,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Paciente, Medico, Disponibilidad, Cita } from '@/types';

export default function AgendarCitaPage() {
  const router = useRouter();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [disponibilidadesLibres, setDisponibilidadesLibres] = useState<Disponibilidad[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form State
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
  const [selectedMedicoId, setSelectedMedicoId] = useState('');
  const [selectedSlotKey, setSelectedSlotKey] = useState(''); // `${id_medico}_${id_sala}_${id_horario}`
  const [motivo, setMotivo] = useState('');

  // Execution feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citaCreada, setCitaCreada] = useState<Cita | null>(null);

  // Cargar Catálogos iniciales
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setLoadingInitial(true);
        const [resPac, resMed] = await Promise.all([
          fetch('/api/pacientes'),
          fetch('/api/medicos'),
        ]);
        const dataPac = await resPac.json();
        const dataMed = await resMed.json();
        setPacientes(dataPac);
        setMedicos(dataMed);
      } catch {
        setError('Error al cargar pacientes y médicos.');
      } finally {
        setLoadingInitial(false);
      }
    };

    cargarCatalogos();
  }, []);

  // Cargar slots libres cuando cambia médico o especialidad
  useEffect(() => {
    const cargarSlotsLibres = async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlotKey('');
        const params = new URLSearchParams({ estado: '0' });
        if (selectedMedicoId) params.append('id_medico', selectedMedicoId);
        if (selectedEspecialidad) params.append('especialidad', selectedEspecialidad);

        const res = await fetch(`/api/disponibilidades?${params.toString()}`);
        const data = await res.json();
        setDisponibilidadesLibres(data);
      } catch {
        console.error('Error al cargar turnos disponibles');
      } finally {
        setLoadingSlots(false);
      }
    };

    cargarSlotsLibres();
  }, [selectedMedicoId, selectedEspecialidad]);

  // Lista única de especialidades
  const especialidades = Array.from(new Set(medicos.map((m) => m.especialidad))).sort();

  // Médicos filtrados por especialidad
  const medicosFiltrados = selectedEspecialidad
    ? medicos.filter((m) => m.especialidad === selectedEspecialidad)
    : medicos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPacienteId) {
      setError('Debes seleccionar el paciente para la cita.');
      return;
    }
    if (!selectedSlotKey) {
      setError('Debes seleccionar un horario disponible.');
      return;
    }
    if (!motivo.trim()) {
      setError('Ingresa el motivo de la consulta médica.');
      return;
    }

    const [id_medico, id_sala, id_horario] = selectedSlotKey.split('_');

    try {
      setSubmitting(true);
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_paciente: selectedPacienteId,
          id_medico,
          id_sala,
          id_horario,
          motivo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al agendar la cita médica.');
      }

      setCitaCreada(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar la cita');
    } finally {
      setSubmitting(false);
    }
  };

  if (citaCreada) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Cita Confirmada
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-3">
            ¡Cita Médica Agendada con Éxito!
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            La disponibilidad correspondiente ha sido bloqueada (estado = 1) en una transacción atómica.
          </p>
        </div>

        {/* Resumen de la cita */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-left space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">ID de Cita:</span>
            <span className="font-mono text-xs font-bold text-slate-700">{citaCreada.id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Paciente:</span>
            <span className="font-bold text-slate-800">
              {citaCreada.paciente?.nombres_completos || pacientes.find((p) => p.id === citaCreada.id_paciente)?.nombres_completos}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Médico:</span>
            <span className="font-bold text-slate-800">
              {citaCreada.medico?.nombres_completos || medicos.find((m) => m.id === citaCreada.id_medico)?.nombres_completos}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Fecha y Hora:</span>
            <span className="font-bold text-hospital-700">
              {citaCreada.horario?.fecha} | {citaCreada.horario?.hora_inicial} - {citaCreada.horario?.hora_final}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Sala Asignada:</span>
            <span className="font-mono font-bold text-slate-700">{citaCreada.id_sala}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Motivo:</span>
            <span className="font-medium text-slate-800 italic">{citaCreada.motivo}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => {
              setCitaCreada(null);
              setSelectedSlotKey('');
              setMotivo('');
            }}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
          >
            Agendar Otra Cita
          </button>
          <Link
            href="/citas"
            className="px-5 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-2"
          >
            Ir a Gestión de Citas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <CalendarPlus className="w-7 h-7 text-hospital-600" />
          Agendamiento de Citas Médicas
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Flujo guiado para programar citas médicas con validación estricta de no colisión.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paso 1: Paciente */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-hospital-600" />
            1. Selección del Paciente
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Paciente Registrado *
            </label>
            <select
              value={selectedPacienteId}
              onChange={(e) => setSelectedPacienteId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
              required
            >
              <option value="">-- Seleccionar Paciente --</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombres_completos} — Tel: {p.telefono} ({p.genero})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              ¿No está en la lista?{' '}
              <Link href="/pacientes" className="text-hospital-600 hover:underline font-semibold">
                Registrar nuevo paciente
              </Link>
            </p>
          </div>
        </div>

        {/* Paso 2: Filtros Especialidad y Médico */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-hospital-600" />
            2. Especialidad y Médico
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Especialidad
              </label>
              <select
                value={selectedEspecialidad}
                onChange={(e) => {
                  setSelectedEspecialidad(e.target.value);
                  setSelectedMedicoId('');
                }}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
              >
                <option value="">Todas las especialidades</option>
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Médico Tratante
              </label>
              <select
                value={selectedMedicoId}
                onChange={(e) => setSelectedMedicoId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
              >
                <option value="">Cualquier médico disponible</option>
                {medicosFiltrados.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombres_completos} ({m.especialidad})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Paso 3: Selección de Franja / Slot Libre */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-hospital-600" />
              3. Turnos y Horarios Libres Disponibles
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-clinical-50 text-clinical-700 border border-clinical-200">
              {disponibilidadesLibres.length} turnos libres
            </span>
          </div>

          {loadingSlots ? (
            <div className="p-8 text-center text-slate-400 text-sm">Buscando slots libres...</div>
          ) : disponibilidadesLibres.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
              <p>No hay turnos libres para los criterios seleccionados.</p>
              <Link
                href="/disponibilidad"
                className="mt-2 inline-block text-xs font-semibold text-hospital-600 hover:underline"
              >
                Asignar nuevas disponibilidades aquí
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {disponibilidadesLibres.map((d) => {
                const key = `${d.id_medico}_${d.id_sala}_${d.id_horario}`;
                const isSelected = selectedSlotKey === key;

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setSelectedSlotKey(key)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-hospital-600 bg-hospital-50/70 shadow-sm ring-2 ring-hospital-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800">
                        {d.horario?.fecha}
                      </span>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {d.id_sala}
                      </span>
                    </div>
                    <div className="mt-2 text-base font-extrabold text-hospital-700">
                      {d.horario?.hora_inicial} - {d.horario?.hora_final}
                    </div>
                    <div className="mt-2 text-xs font-medium text-slate-700 truncate">
                      {d.medico?.nombres_completos}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {d.medico?.especialidad}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Paso 4: Motivo de Consulta y Confirmación */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-hospital-600" />
            4. Motivo y Confirmación
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Motivo de la Consulta *
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Control de hipertensión arterial, dolor lumbar persistente, etc."
              className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-hospital-500"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !selectedSlotKey || !selectedPacienteId}
              className="w-full py-3.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? 'Confirmando Cita Atómica...' : 'Confirmar y Agendar Cita Médica'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
