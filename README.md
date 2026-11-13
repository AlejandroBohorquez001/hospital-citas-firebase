# Hospital Metropolitano — Sistema de Gestión de Citas Médicas

Aplicación web full-stack para la gestión integral de citas médicas hospitalarias, diseñada bajo **Clean Architecture** y el **Patrón Repository**, permitiendo alternar de forma 100% transparente entre dos capas de persistencia completamente diferentes mediante una variable de entorno:

- **Versión A (Relacional):** PostgreSQL con **Prisma ORM** (integridad referencial, claves compuestas, índices y transacciones ACID).
- **Versión B (No Relacional):** **Firebase Firestore** con SDK de `firebase-admin` server-side (desnormalización de documentos para lecturas ultrarrápidas, transacciones atómicas con `runTransaction` e índices compuestos).

Ambas versiones comparten la misma interfaz visual responsive y la misma lógica de negocio.

---

## 🏥 Características Principales

1. **Dashboard en Tiempo Real:**
   - Métricas de citas del día actual.
   - Conteo de turnos libres en salas de consulta.
   - Gráfica/distribución de citas por especialidad médica.
   - Listado rápido de próximas citas programadas.
2. **Directorio de Médicos (CRUD):**
   - Registro de especialistas, teléfonos, consultorios y especialidad.
   - Filtro reactivo por nombre y especialidad.
3. **Directorio de Pacientes (CRUD):**
   - Registro de pacientes, número de contacto, género y dirección domiciliaria.
4. **Catálogo de Horarios:**
   - Creación de bloques horarios (ej: 08:00 - 08:30, 10:00 - 10:30) y asignación de pabellón.
   - Generador en 1 clic de franjas horarias de 30 minutos para cualquier fecha.
5. **Gestión de Disponibilidad:**
   - Asignación de un médico a una sala física en un horario específico.
   - Validación estricta de conflictos:
     - Un médico no puede tener dos turnos en el mismo horario.
     - Una sala física no puede ser ocupada por dos médicos simultáneamente.
6. **Agendamiento Guiado de Citas:**
   - Selección de paciente, especialidad, médico y slot libre.
   - Transacción atómica de reserva: el estado de la disponibilidad cambia de `0` (libre) a `1` (ocupada).
7. **Gestión de Citas:**
   - Listado con filtros por estado, médico tratante y fecha.
   - Transacción de cancelación: la cita pasa a estado `cancelada` y el turno vuelve automáticamente a estado `0` (libre).
   - Marcado de citas como `atendida`.

---

## 🛠️ Stack Tecnológico

- **Frontend & Backend:** [Next.js](https://nextjs.org/) (App Router) + TypeScript + [Tailwind CSS](https://tailwindcss.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Persistencia Relacional:** PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- **Persistencia No Relacional:** [Firebase Firestore](https://firebase.google.com/docs/firestore) + `firebase-admin`
- **Arquitectura:** Repository Pattern con factoría dinámica (`IRepositoryContainer`)

---

## 🔄 Conmutación de Base de Datos (`DB_PROVIDER`)

Para alternar entre la versión Relacional y la versión NoSQL, basta con cambiar el valor de `DB_PROVIDER` en tu archivo `.env`:

```env
# Para usar PostgreSQL con Prisma:
DB_PROVIDER=postgres

# Para usar Firebase Firestore:
DB_PROVIDER=firestore
```

La factoría `src/lib/repositories/index.ts` detecta el valor y suministra la implementación adecuada a todas las rutas de API y componentes del servidor sin modificar una sola línea de código frontend.

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar e Instalar Dependencias

```bash
git clone <tu-repositorio>
cd hospital-citas
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y ajusta los valores:

```bash
cp .env.example .env
```

---

### 3. Configuración de Versión A (PostgreSQL)

Puedes usar un proveedor gratuito en la nube como **Neon** o **Supabase**:

#### Opción Neon (Recomendado - 100% gratuito):
1. Regístrate en [neon.tech](https://neon.tech/) y crea un nuevo proyecto.
2. Copia la cadena de conexión proporcionada (formato: `postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`).
3. Pégala en `DATABASE_URL` en tu archivo `.env`.
4. Ejecuta el esquema de Prisma y las migraciones:
   ```bash
   npx prisma db push
   ```
5. Ejecuta el script de datos iniciales (Seed):
   ```bash
   npm run seed:postgres
   ```

---

### 4. Configuración de Versión B (Firebase Firestore)

1. Ve a la consola de [Firebase](https://console.firebase.google.com/) y crea un proyecto nuevo (ej: `hospital-citas`).
2. En el menú lateral, ve a **Compilación > Firestore Database** y haz clic en **Crear base de datos** (modo producción o prueba en tu región preferida).
3. Ve a **Configuración del Proyecto > Cuentas de Servicio**.
4. Haz clic en **Generar nueva clave privada**. Se descargará un archivo `.json`.
5. Abre el `.json` descargado y copia los valores en tu `.env`:
   ```env
   DB_PROVIDER=firestore
   FIREBASE_PROJECT_ID="tu-proyecto-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@tu-proyecto-id.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\n-----END PRIVATE KEY-----\n"
   ```
   *(Opcional: en Vercel puedes pegar todo el JSON en `FIREBASE_SERVICE_ACCOUNT_KEY`).*
6. Despliega los índices compuestos de Firestore:
   ```bash
   npx firebase-tools deploy --only firestore:indexes
   ```
   *(El archivo `firestore.indexes.json` ya está configurado en la raíz).*
7. Ejecuta el seed en Firestore:
   ```bash
   npm run seed:firestore
   ```

---

### 5. Iniciar la Aplicación en Modo Desarrollo

```bash
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000). Verás la insignia de motor activo en la barra de navegación superior.

---

## 🚢 Despliegue en Vercel

1. Sube tu código a un repositorio en **GitHub**, **GitLab** o **Bitbucket**.
2. Ve a [vercel.com](https://vercel.com/) e importa el repositorio.
3. En la sección **Environment Variables**, configura las variables según el proveedor que vayas a usar:

### Para Desplegar con PostgreSQL:
- `DB_PROVIDER`: `postgres`
- `DATABASE_URL`: tu cadena de conexión de Neon o Supabase.

### Para Desplegar con Firestore:
- `DB_PROVIDER`: `firestore`
- `FIREBASE_PROJECT_ID`: el id de tu proyecto en Firebase.
- `FIREBASE_CLIENT_EMAIL`: el email de la cuenta de servicio.
- `FIREBASE_PRIVATE_KEY`: la clave privada completa con saltos `\n`.
  *(O bien `FIREBASE_SERVICE_ACCOUNT_KEY` con el contenido del JSON).*

4. Haz clic en **Deploy**. El comando de build (`prisma generate && next build`) compilará el proyecto de manera automática.

---

## 🧪 Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:3000`. |
| `npm run build` | Genera el cliente de Prisma y compila la aplicación para producción. |
| `npm run start` | Inicia la aplicación compilada en modo producción. |
| `npm run seed` | Ejecuta el seed correspondiente a la base de datos configurada en `DB_PROVIDER`. |
| `npm run seed:postgres` | Inserta 5 médicos, 10 pacientes, turnos de 30 min y disponibilidades en PostgreSQL. |
| `npm run seed:firestore` | Inserta los mismos datos de prueba iniciales en colecciones de Firestore. |
| `npx prisma studio` | Abre el explorador visual de base de datos de Prisma en `localhost:5555`. |

---

## 📂 Estructura del Proyecto

```
hospital-citas/
├── docs/
│   └── diseno-persistencia.md    # Diagramas ER, NoSQL, tabla comparativa y justificación
├── prisma/
│   └── schema.prisma             # Modelo relacional PostgreSQL con restricciones e índices
├── scripts/
│   ├── seed-data.ts              # Catálogos maestros de médicos, pacientes y horarios
│   ├── seed-postgres.ts          # Script de inserción inicial para PostgreSQL
│   ├── seed-firestore.ts         # Script de inserción inicial para Firestore
│   └── seed.ts                   # Despachador de seed según DB_PROVIDER
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── medicos/          # CRUD API Médicos
│   │   │   ├── pacientes/        # CRUD API Pacientes
│   │   │   ├── horarios/         # CRUD API Horarios
│   │   │   ├── disponibilidades/ # Asignación y consulta de slots
│   │   │   ├── citas/            # Transacciones de creación y cancelación
│   │   │   ├── dashboard/        # Métricas y KPIs en tiempo real
│   │   │   └── config/           # Información de proveedor activo
│   │   ├── medicos/              # Vista de Directorio Médico
│   │   ├── pacientes/            # Vista de Directorio de Pacientes
│   │   ├── horarios/             # Vista de Catálogo de Franjas Horarias
│   │   ├── disponibilidad/       # Vista de Asignación de Turnos y Salas
│   │   ├── agendar/              # Vista de Agendamiento Guiado de Citas
│   │   ├── citas/                # Vista de Gestión y Cancelación de Citas
│   │   ├── layout.tsx            # Layout con barra de navegación e indicador de DB
│   │   └── page.tsx              # Dashboard hospitalario
│   ├── components/
│   │   └── Navigation.tsx        # Barra de navegación con badge dinámico de motor
│   ├── lib/
│   │   ├── firebase-admin.ts     # Inicialización del SDK de Firestore
│   │   ├── prisma.ts             # Cliente singleton de Prisma
│   │   └── repositories/
│   │       ├── interfaces.ts     # Contratos e interfaces del Repository Pattern
│   │       ├── index.ts          # Factoría del Repository Container
│   │       ├── prisma/           # Implementaciones para PostgreSQL
│   │       └── firestore/        # Implementaciones para Firebase Firestore
│   └── types/
│       └── index.ts              # Tipos TypeScript y DTOs del dominio
├── firestore.indexes.json        # Índices compuestos para Firebase Firestore
├── tailwind.config.ts            # Paleta de colores hospitalaria
├── .env.example                  # Plantilla de variables de entorno
└── package.json
```
