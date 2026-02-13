Aula Virtual — Documentación
Plataforma de clases en línea con evaluación automática por IA.

Stack tecnológico
Capa	Tecnología
Framework	Next.js 16 (App Router)
Lenguaje	TypeScript 5
Base de datos	PostgreSQL + pg (sin ORM)
Autenticación	NextAuth v5 (JWT, Credentials)
IA	Google Gemini vía Vercel AI SDK
Estilos	Tailwind CSS v4
Email	Nodemailer 7 (Gmail SMTP)
Exportación	ExcelJS
Validación	Zod v4
Estructura del proyecto
plataforma-clases/
├── app/
│   ├── actions/          # Server Actions (login, register, passwords)
│   ├── admin/            # Panel de administración (solo admins)
│   ├── api/
│   │   ├── chat/         # Endpoint de chat con Gemini
│   │   └── export/       # Descarga Excel de respuestas
│   ├── courses/[id]/[videoId]/  # Página de clase con video + chat
│   ├── login/            # Inicio de sesión
│   ├── register/         # Registro de alumnos
│   ├── forgot-password/  # Solicitar recuperación de contraseña
│   └── reset-password/   # Cambiar contraseña con token
├── components/
│   ├── ChatInterface.tsx # Chat IA + evaluación automática
│   └── VideoPlayer.tsx   # Reproductor de YouTube
├── data/
│   └── courses.ts        # Cursos y preguntas de evaluación
├── infrastructure/
│   └── youtube.service.ts # Obtención de transcripción de videos
├── lib/
│   ├── db.ts             # Singleton de conexión PostgreSQL
│   ├── users.ts          # Consultas de usuarios
│   ├── answers.ts        # Guardar y leer respuestas de alumnos
│   ├── tokens.ts         # Tokens de recuperación de contraseña
│   ├── email.ts          # Envío de emails (bienvenida, reset)
│   └── validations.ts    # Esquemas Zod compartidos ← fuente única de validación
├── types/
│   └── next-auth.d.ts    # Extensión de tipos de NextAuth (role, id)
└── auth.ts               # Configuración de NextAuth
Variables de entorno
Copia .env.example a .env y completa cada valor. Nunca subas .env a Git.

Variable	Descripción
DATABASE_URL	Cadena de conexión PostgreSQL (postgresql://...)
AUTH_SECRET	Clave secreta para firmar JWTs. Genera con: openssl rand -base64 32
EMAIL_FROM	Dirección de correo para envíos (Gmail)
EMAIL_PASSWORD	App Password de Gmail (no la contraseña de tu cuenta)
NEXT_PUBLIC_APP_URL	URL base de la app (e.g. http://localhost:3000 en desarrollo)
GOOGLE_GENERATIVE_AI_API_KEY	API Key de Google AI Studio para Gemini
Base de datos
Tablas requeridas
Ejecutar en psql antes de iniciar la app:

CREATE TABLE users (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name         TEXT,
  email        TEXT UNIQUE,
  password     TEXT,
  image        TEXT,
  role         TEXT NOT NULL DEFAULT 'student',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id    TEXT NOT NULL REFERENCES users(id),
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_answers (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id),
  course_id   TEXT NOT NULL,
  video_id    TEXT NOT NULL,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  is_correct  BOOLEAN,
  ai_feedback TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
Promover a administrador
UPDATE users SET role = 'admin' WHERE email = 'correo_del_admin';
Flujos principales
1. Autenticación
/login → authenticate() → NextAuth Credentials
  → getUserByEmail() → bcrypt.compare()
  → JWT con { id, name, email, role }
  → redirige a /
2. Registro
/register → registerUser()
  → registerSchema (Zod) — contraseña fuerte validada aquí
  → bcrypt.hash(password, 12)
  → createUser()
  → sendWelcomeEmail() [no bloquea si el servidor SMTP falla]
3. Recuperación de contraseña
/forgot-password → forgotPassword()
  → createPasswordResetToken() — UUID, expira en 1 hora
  → sendPasswordResetEmail()

/reset-password/[token] → resetPassword()
  → resetPasswordSchema (Zod)
  → getValidToken() — verifica que no esté expirado ni usado
  → bcrypt.hash(nuevaContraseña, 12)
  → updatePassword() + markTokenAsUsed()
4. Chat con evaluación IA
Alumno abre clase → timer dispara una pregunta cada (duración/3)
  → Gemini formula la pregunta al alumno
  → Alumno responde en el chat

POST /api/chat
  → auth() — el userId siempre viene de la sesión del servidor
  → Gemini evalúa y añade [EVAL:SI] o [EVAL:NO] al final
  → onFinish: parseamos la etiqueta → saveStudentAnswer()
  → El cliente filtra [EVAL:...] antes de renderizar
5. Panel de administración
/admin  (solo role === 'admin')
  → getEngagementByStudent() → tabla con % acierto por alumno
  → getAllAnswers()           → tabla detallada de respuestas

GET /api/export  (solo role === 'admin')
  → genera y descarga .xlsx con ExcelJS
Seguridad
Aspecto	Solución
Contraseñas débiles	Zod: mín. 8 chars, mayúscula, número, carácter especial
Hash de contraseñas	bcrypt con coste 12
userId en el chat	Siempre proviene de auth() en el servidor — nunca del cliente
Exportación de datos	/api/export requiere role === 'admin'
Panel admin	Redirige a / si role !== 'admin'
Enumeración de emails	forgotPassword siempre devuelve el mismo mensaje
Tokens de reset	UUID único, expiran en 1h, se marcan used al utilizarse
JWT	Firmado con AUTH_SECRET — NextAuth rechaza tokens sin él
Roles de usuario
Rol	Quién es	Acceso adicional
student	Alumnos registrados	Cursos, chat IA
admin	Profesor / administrador	/admin, exportar Excel
Validaciones de contraseña
Definidas en lib/validations.ts y reutilizadas en registro y reset de contraseña:

Mínimo 8 caracteres
Al menos una letra mayúscula
Al menos un número
Al menos un carácter especial (!@#$%^&*…)
El formulario de login no aplica estas reglas para no bloquear cuentas con contraseñas antiguas.

Agregar un nuevo curso
Edita data/courses.ts y agrega una entrada al array misClases:

{
  id: "mi-curso",
  title: "Nombre del curso",
  description: "Descripción corta",
  youtubeUrl: "https://youtube.com/watch?v=VIDEO_ID",
  thumbnail: "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
  duration: "10:30",  // formato mm:ss
  questions: {
    q1: "¿Cuál es el concepto principal del video?",
    q2: "¿Qué ejemplo se menciona en el minuto 5?",
    q3: "Resume en una frase lo que aprendiste.",
  },
}
