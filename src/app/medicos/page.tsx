'use client';

import { useState, useEffect } from 'react';
import {
  Stethoscope,
  Plus,
  Trash2,
  Edit2,
  Phone,
  MapPin,
  Search,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Medico } from '@/types';

export default function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null);

  // Form State
  const [nombres, setNombres] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cargarMedicos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/medicos');
      const data = await res.json();
      setMedicos(data);
    } catch {
      console.error('Error al cargar médicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMedicos();
  }, []);

  const abrirModalCrear = () => {
    setEditingMedico(null);
    setNombres('');
    setTelefono('');
    setDireccion('');
    setEspecialidad('');
    setFormError(null);
    setFormSuccess(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (m: Medico) => {
    setEditingMedico(m);
    setNombres(m.nombres_completos);
    setTelefono(m.telefono);
    setDireccion(m.direccion);
    setEspecialidad(m.especialidad);
    setFormError(null);
    setFormSuccess(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validaciones
    if (!nombres.trim() || !telefono.trim() || !direccion.trim() || !especialidad.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    const telDigits = telefono.replace(/\D/g, '');
    if (telDigits.length < 7) {
      setFormError('El teléfono debe tener al menos 7 dígitos válidos.');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingMedico ? `/api/medicos/${editingMedico.id}` : '/api/medicos';
      const method = editingMedico ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres_completos: nombres,
          telefono,
          direccion,
          especialidad,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el médico');
      }

      setFormSuccess(editingMedico ? 'Médico actualizado correctamente' : 'Médico creado con éxito');
      cargarMedicos();
      setTimeout(() => {
        setModalOpen(false);
      }, 700);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar al médico "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/medicos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al eliminar');
        return;
      }
      cargarMedicos();
    } catch {
      alert('Error de conexión al eliminar médico.');
    }
  };

  const medicosFiltrados = medicos.filter(
    (m) =>
      m.nombres_completos.toLowerCase().includes(filtro.toLowerCase()) ||
      m.especialidad.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-hospital-600" />
            Cuerpo Médico
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión y directorio de especialistas médicos del hospital.
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Nuevo Médico
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nombre o especialidad..."
          className="w-full text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Tabla / Lista */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando especialistas...</div>
        ) : medicosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No se encontraron médicos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Nombre del Especialista</th>
                  <th className="py-3.5 px-6">Especialidad</th>
                  <th className="py-3.5 px-6">Teléfono</th>
                  <th className="py-3.5 px-6">Dirección / Consultorio</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicosFiltrados.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {m.nombres_completos}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-hospital-50 text-hospital-700 border border-hospital-200">
                        {m.especialidad}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {m.telefono}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {m.direccion}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => abrirModalEditar(m)}
                        className="p-1.5 text-slate-400 hover:text-hospital-600 rounded-lg hover:bg-hospital-50 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(m.id, m.nombres_completos)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMedico ? 'Editar Especialista Médico' : 'Registrar Nuevo Especialista'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nombres y Apellidos *
                </label>
                <input
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ej: Dra. Camila Restrepo"
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Especialidad Médica *
                </label>
                <input
                  type="text"
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  placeholder="Ej: Cardiología, Pediatría, Neurología..."
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 3105551234"
                    className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Dirección / Consultorio *
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej: Torre A, Cons. 301"
                    className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-hospital-600 hover:bg-hospital-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingMedico ? 'Actualizar' : 'Guardar Médico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
