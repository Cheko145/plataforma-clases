-- ============================================================
-- Schema completo de plataforma-clases
-- Compatible con PostgreSQL 13+ / Supabase
-- Ejecutar en: Supabase → SQL Editor → Run
-- Seguro para re-ejecutar (IF NOT EXISTS en cada tabla)
-- ============================================================

-- 1. USUARIOS (debe crearse primero — otras tablas la referencian)
CREATE TABLE IF NOT EXISTS public.users (
  id         text        NOT NULL DEFAULT (gen_random_uuid())::text,
  name       text,
  email      text        UNIQUE,
  password   text,
  image      text,
  role       text        NOT NULL DEFAULT 'student',
  created_at timestamptz          DEFAULT now(),
  updated_at timestamptz          DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 2. TOKENS DE RESTABLECIMIENTO DE CONTRASEÑA
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id         text        NOT NULL DEFAULT (gen_random_uuid())::text,
  user_id    text        NOT NULL,
  token      text        NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used       boolean              DEFAULT false,
  created_at timestamptz          DEFAULT now(),
  CONSTRAINT password_reset_tokens_pkey        PRIMARY KEY (id),
  CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 3. RESPUESTAS DE ALUMNOS
CREATE TABLE IF NOT EXISTS public.student_answers (
  id          text        NOT NULL DEFAULT (gen_random_uuid())::text,
  user_id     text        NOT NULL,
  course_id   text        NOT NULL,
  video_id    text        NOT NULL,
  question    text        NOT NULL,
  answer      text        NOT NULL,
  is_correct  boolean,
  ai_feedback text,
  created_at  timestamptz          DEFAULT now(),
  CONSTRAINT student_answers_pkey         PRIMARY KEY (id),
  CONSTRAINT student_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 4. PREGUNTAS DE EVALUACIÓN POR VIDEO (generadas por IA, compartidas entre alumnos)
CREATE TABLE IF NOT EXISTS public.video_questions (
  id          text        NOT NULL DEFAULT (gen_random_uuid())::text,
  video_id    text        NOT NULL,
  question    text        NOT NULL,
  order_index integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_questions_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_video_questions_video_id ON public.video_questions(video_id);

-- 5. CURSOS (migrado desde data/courses.ts — gestión dinámica desde el admin)
CREATE TABLE IF NOT EXISTS public.courses (
  id          text        NOT NULL,
  title       text        NOT NULL,
  description text,
  thumbnail   text,
  youtube_url text        NOT NULL,
  duration    text,
  created_at  timestamptz DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);

-- 6. GRUPOS DE ALUMNOS
CREATE TABLE IF NOT EXISTS public.groups (
  id          text        NOT NULL DEFAULT (gen_random_uuid())::text,
  name        text        NOT NULL,
  description text,
  created_at  timestamptz DEFAULT now(),
  CONSTRAINT groups_pkey PRIMARY KEY (id)
);

-- 7. ALUMNOS ↔ GRUPOS (muchos a muchos)
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id text        NOT NULL,
  user_id  text        NOT NULL,
  added_at timestamptz DEFAULT now(),
  CONSTRAINT group_members_pkey   PRIMARY KEY (group_id, user_id),
  CONSTRAINT gm_group_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id)  ON DELETE CASCADE,
  CONSTRAINT gm_user_fkey  FOREIGN KEY (user_id)  REFERENCES public.users(id)   ON DELETE CASCADE
);

-- 8. CURSOS ↔ GRUPOS (control de acceso)
CREATE TABLE IF NOT EXISTS public.group_courses (
  group_id    text        NOT NULL,
  course_id   text        NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  CONSTRAINT group_courses_pkey    PRIMARY KEY (group_id, course_id),
  CONSTRAINT gc_group_fkey  FOREIGN KEY (group_id)  REFERENCES public.groups(id)  ON DELETE CASCADE,
  CONSTRAINT gc_course_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);

-- SEED: migrar curso existente de data/courses.ts
INSERT INTO public.courses (id, title, description, thumbnail, youtube_url, duration)
VALUES (
  'video_1',
  'Unidad 2: Identificacion de oportunidades de negocio y desarrollo de productos',
  'Propiedad Intelectual',
  'https://i.ytimg.com/vi/1iWXyKuMHXI/hqdefault.jpg',
  'https://www.youtube.com/watch?v=1iWXyKuMHXI',
  '3:29'
)
ON CONFLICT (id) DO NOTHING;
