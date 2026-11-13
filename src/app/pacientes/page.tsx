'use client';

import { useState, useEffect } from 'react';
import {
  Users,
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
import { Paciente } from '@/types';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);

  // Form State
  const [nombres, setNombres] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [genero, setGenero] = useState('M');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pacientes');
      const data = await res.json();
      setPacientes(data);
    } catch {
      console.error('Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const abrirModalCrear = () => {
    setEditingPaciente(null);
    setNombres('');
    setTelefono('');
    setDireccion('');
    setGenero('M');
    setFormError(null);
    setFormSuccess(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (p: Paciente) => {
    setEditingPaciente(p);
    setNombres(p.nombres_completos);
    setTelefono(p.telefono);
    setDireccion(p.direccion);
    setGenero(p.genero);
    setFormError(null);
    setFormSuccess(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!nombres.trim() || !telefono.trim() || !direccion.trim() || !genero) {
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
      const url = editingPaciente ? `/api/pacientes/${editingPaciente.id}` : '/api/pacientes';
      const method = editingPaciente ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres_completos: nombres,
          telefono,
          direccion,
          genero,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar paciente');
      }

      setFormSuccess(editingPaciente ? 'Paciente actualizado' : 'Paciente registrado con éxito');
      cargarPacientes();
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
    if (!confirm(`¿Estás seguro de eliminar al paciente "${nombre}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/pacientes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al eliminar');
        return;
      }
      cargarPacientes();
    } catch {
      alert('Error de conexión al eliminar paciente.');
    }
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombres_completos.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-hospital-600" />
            Directorio de Pacientes
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión y registro de pacientes afiliados al hospital.
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Nuevo Paciente
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar paciente por nombre..."
          className="w-full text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando pacientes...</div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No se encontraron pacientes registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Nombres y Apellidos</th>
                  <th className="py-3.5 px-6">Género</th>
                  <th className="py-3.5 px-6">Teléfono</th>
                  <th className="py-3.5 px-6">Dirección</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pacientesFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {p.nombres_completos}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.genero === 'F'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : p.genero === 'M'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {p.genero === 'F' ? 'Femenino' : p.genero === 'M' ? 'Masculino' : 'Otro'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {p.telefono}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {p.direccion}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => abrirModalEditar(p)}
                        className="p-1.5 text-slate-400 hover:text-hospital-600 rounded-lg hover:bg-hospital-50 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(p.id, p.nombres_completos)}
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
                {editingPaciente ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
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
                  placeholder="Ej: Juan Camilo Pérez"
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Género *
                  </label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 3001112233"
                    className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Dirección de Residencia *
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Calle 50 # 12-34"
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  required
                />
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
                  {submitting ? 'Guardando...' : editingPaciente ? 'Actualizar' : 'Guardar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
