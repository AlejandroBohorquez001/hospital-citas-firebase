export const SEED_MEDICOS = [
  {
    nombres_completos: 'Dra. Valentina Restrepo',
    telefono: '3105551234',
    direccion: 'Av. Salud 45-12, Consultorio 301',
    especialidad: 'Cardiología',
  },
  {
    nombres_completos: 'Dr. Carlos Mario Gómez',
    telefono: '3154445678',
    direccion: 'Calle 10 # 25-14, Consultorio 102',
    especialidad: 'Pediatría',
  },
  {
    nombres_completos: 'Dra. Diana Marcela Torres',
    telefono: '3008889900',
    direccion: 'Cra 15 # 80-20, Piso 4',
    especialidad: 'Dermatología',
  },
  {
    nombres_completos: 'Dr. Andrés Felipe Morales',
    telefono: '3187776655',
    direccion: 'Edificio Torre Médica B, Consultorio 205',
    especialidad: 'Traumatología',
  },
  {
    nombres_completos: 'Dra. Laura Sofía Peña',
    telefono: '3123332211',
    direccion: 'Av. Las Palmas # 12-05',
    especialidad: 'Medicina General',
  },
];

export const SEED_PACIENTES = [
  {
    nombres_completos: 'Juan Camilo Pérez',
    telefono: '3001112233',
    direccion: 'Calle 50 # 12-34',
    genero: 'M',
  },
  {
    nombres_completos: 'María Camila Rodríguez',
    telefono: '3112223344',
    direccion: 'Cra 7 # 45-67',
    genero: 'F',
  },
  {
    nombres_completos: 'Sofía Victoria Ospina',
    telefono: '3123334455',
    direccion: 'Calle 85 # 11-20',
    genero: 'F',
  },
  {
    nombres_completos: 'Mateo Sebastián Castro',
    telefono: '3134445566',
    direccion: 'Transversal 23 # 45-12',
    genero: 'M',
  },
  {
    nombres_completos: 'Luciana Gómez Morales',
    telefono: '3145556677',
    direccion: 'Cra 10 # 30-15',
    genero: 'F',
  },
  {
    nombres_completos: 'Santiago Alejandro Silva',
    telefono: '3156667788',
    direccion: 'Calle 100 # 19-45',
    genero: 'M',
  },
  {
    nombres_completos: 'Isabella Ramírez Vargas',
    telefono: '3167778899',
    direccion: 'Av. Caracas # 55-10',
    genero: 'F',
  },
  {
    nombres_completos: 'Samuel David Herrera',
    telefono: '3178889900',
    direccion: 'Calle 63 # 24-80',
    genero: 'M',
  },
  {
    nombres_completos: 'Mariana Duque Mendoza',
    telefono: '3189990011',
    direccion: 'Cra 68 # 80-50',
    genero: 'F',
  },
  {
    nombres_completos: 'Gabriel Antonio Rojas',
    telefono: '3190001122',
    direccion: 'Calle 127 # 45-60',
    genero: 'M',
  },
];

// Genera fechas para hoy, mañana y pasado mañana
export function getFechasSeed() {
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  const pasado = new Date(hoy);
  pasado.setDate(pasado.getDate() + 2);

  const format = (d: Date) => d.toISOString().split('T')[0];

  return [format(hoy), format(manana), format(pasado)];
}

export const BLOQUES_HORARIOS = [
  { hora_inicial: '08:00', hora_final: '08:30' },
  { hora_inicial: '08:30', hora_final: '09:00' },
  { hora_inicial: '09:00', hora_final: '09:30' },
  { hora_inicial: '09:30', hora_final: '10:00' },
  { hora_inicial: '10:00', hora_final: '10:30' },
  { hora_inicial: '10:30', hora_final: '11:00' },
  { hora_inicial: '11:00', hora_final: '11:30' },
  { hora_inicial: '11:30', hora_final: '12:00' },
  { hora_inicial: '14:00', hora_final: '14:30' },
  { hora_inicial: '14:30', hora_final: '15:00' },
];

export const SALAS = ['Sala 101', 'Sala 102', 'Sala 201', 'Sala 202', 'Sala 301'];
