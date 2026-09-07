# RAG Agent Evals - Devscale Indonesia Batch I
## Assignment Day 14 & Day 15

**Instruksi**
Project ini adalah Employee Handbook RAG Agent. Tugasnya adalah membuat dan menjalankan evals sampai semua test case pass.

Assignment notes:

- Total ada 30 eval cases.
- Target akhir: 100% pass rate.
- Hasil eval dikirim ke Anvia Lens.
- Setelah pass, jelaskan apa yang diubah.

Saran implementasi:

- Pakai beberapa metric: relevancy, faithfulness, gEval, contains, dan exactMatch.
- `exactMatch()` hanya untuk jawaban yang harus sama persis, misalnya `Reply exactly: ...`.
- Untuk jawaban RAG yang natural, pakai relevancy, faithfulness, gEval, atau contains.
- Faithfulness perlu evidence, jadi beberapa case memakai `retrievalContext`.

## Langkah Pengerjaan Assigment

Use case yang dibuat:
Employee Handbook Assistant.

- User bertanya tentang handbook.
- Agent mencari jawaban dari `documents/devscale-employee-handbook.md`.
- Evals mengecek apakah jawaban agent benar, relevan, dan tidak mengarang.

**Pattern yang digunakan (Day 14 & Day 15)**

- RAG: agent mencari context dari handbook sebelum menjawab.
- Tool calling: agent memakai `handbookSearch`.
- LLM judge: model lain mengecek jawaban untuk metric relevancy, faithfulness, dan gEval.
- Lens reporter: hasil eval dikirim ke Anvia Lens.

**Tech stack:**

- TypeScript, Node.js, pnpm
- React + Vite untuk frontend
- Hono untuk backend API
- PostgreSQL + Prisma untuk memory
- Qdrant untuk vector search handbook
- Anvia untuk agent dan evals
- Anvia Lens untuk melihat trace/eval result
- Docker untuk menjalankan PostgreSQL dan Qdrant

## Membuat Project Dari scratch

Bagian ini menjelaskan susunan project secara singkat. Jika folder project sudah ada, kamu bisa langsung lompat ke bagian **Menjalankan Project Setelah Clone/Fork Dari GitHub**.

Hal penting:

- App ini berbentuk monorepo.
- Frontend ada di `apps/platform`.
- Backend ada di `apps/api`.
- Agent dan eval ada di `packages/agents`.

### 1. Prerequisites

Install dulu:

- Node.js 22+
- pnpm
- Docker Desktop
- Git
- OpenAI API key

Cek:

```powershell
node --version
pnpm.cmd --version
docker --version
```

### 2. Buat Root Monorepo

Struktur monorepo:

```text
apps/
  api/
  platform/
packages/
  agents/
documents/
```

Workspace diatur oleh `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 3. Install Tooling Root

Dependency project diinstall dari root folder:

```powershell
pnpm.cmd install
```

### 4. Buat Backend Hono

Backend ada di:

```text
apps/api
```

Route penting:

- `GET /api/chat/sessions` -> list chat session.
- `POST /api/chat/sessions` -> buat chat session.
- `POST /api/chat/:sessionId` -> kirim chat ke agent.

API berjalan di:

```text
http://localhost:8000
```

### 5. Buat Frontend Platform

Frontend ada di:

```text
apps/platform
```

Frontend berjalan di:

```text
http://localhost:3000
```

### 6. Tambahkan TanStack Router

Routing frontend ada di:

```text
apps/platform/src/routes
```

Jika route berubah, jalankan:

```powershell
pnpm.cmd --filter @repo/platform generate-routes
```

### 7. Tambahkan Styling Frontend

Style utama ada di:

```text
apps/platform/src/styles.css
```

UI berisi chat page, sidebar session, input prompt, dan tampilan tool call.

### 8. Fetch Data Dari Backend

Frontend memanggil backend:

```text
GET  /api/chat/sessions
POST /api/chat/sessions
POST /api/chat/:sessionId
```

### 9. Kirim Data Dari Form Ke API

Flow chat:

1. User menulis pertanyaan.
2. Frontend mengirim pesan ke API.
3. API menjalankan agent.
4. Agent mencari handbook context.
5. Jawaban dikirim balik ke frontend.

### 10. Buat Shared Agent Package

Agent dan eval ada di:

```text
packages/agents
```

File penting:

- `src/agent.ts`
- `src/prompts/base-instructions.ts`
- `src/tools/handbook-search.ts`
- `src/evals/cases.ts`
- `src/evals/run.ts`

### 11. Buat Agent Tools

Tool utama:

- `handbookSearch`: mencari isi handbook.
- `webSearch`: mencari info eksternal jika perlu.
- `webExtract`: membaca isi URL jika perlu.

### 12. Buat Chat Session Dan Archive

Chat session disimpan sebagai memory di PostgreSQL.

Table penting:

- `AgentMemorySession`
- `AgentMemoryMessage`

### 13. Buat Database Dengan Docker

Jalankan PostgreSQL dan Qdrant:

```powershell
docker compose -f docker-compose.dev.yml up -d db qdrant
```

Cek:

```powershell
docker compose -f docker-compose.dev.yml ps
```

### 14. Environment Variables

Buat `.env`:

```powershell
Copy-Item .env.example .env
```

Isi minimal:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:15435/postgres"
OPENAI_API_KEY=""
OPENAI_BASE_URL=""
OPENAI_MODEL="gpt-5-mini"
OPENAI_JUDGE_MODEL="gpt-5"
OPENAI_JUDGE_COMPLETION_API="responses"
ANVIA_LENS_BASE_URL="http://localhost:8080"
ANVIA_LENS_PUBLIC_KEY=""
ANVIA_LENS_SECRET_KEY=""
ANVIA_LENS_MEDIA_UPLOAD_ENABLED=false
```

Jangan commit `.env`.

### 15. Prisma Setup

Setup database:

```powershell
pnpm.cmd db:generate
pnpm.cmd db:migrate
```

### 16. Jalankan Project

Urutan run lokal:

```powershell
pnpm.cmd install
docker compose -f docker-compose.dev.yml up -d db qdrant
pnpm.cmd db:generate
pnpm.cmd db:migrate
pnpm.cmd ingest:handbook
pnpm.cmd dev
```

Buka:

```text
http://localhost:3000
```

### 17. Typed Frontend-Backend Communication

Tipe data chat ada di:

```text
apps/platform/src/modules/chat/types.ts
apps/api/src/modules/chat/router.ts
```

Tujuannya supaya frontend dan backend memakai bentuk data yang sama.

### 18. Document Assistant Flow

Flow RAG:

1. Handbook ada di `documents/devscale-employee-handbook.md`.
2. `pnpm ingest:handbook` memasukkan handbook ke Qdrant.
3. Agent memakai `handbookSearch`.
4. Agent menjawab berdasarkan hasil search.

### 19. Worker Dan Queue

Project ini tidak memakai worker queue.

Handbook ingest dijalankan manual:

```powershell
pnpm.cmd ingest:handbook
```

### 20. Streaming Chat UI

UI chat streaming ada di:

```text
apps/platform/src/modules/chat/components/chat.tsx
```

Jawaban agent muncul bertahap di browser.

### 21. Agent Memory, Tools, Dan Tracing

Agent memakai:

- memory untuk chat session
- tools untuk handbook search
- Anvia Lens untuk trace dan eval result

File utama:

```text
packages/agents/src/agent.ts
packages/agents/src/evals/run.ts
packages/agents/src/evals/lens.ts
```

### 22. Build Dan Test

Cek build:

```powershell
pnpm.cmd build
```

Run eval assignment:

```powershell
pnpm.cmd eval
```

Saat eval selesai, cari bagian ini di terminal:

```text
employee-handbook-relevancy
employee-handbook-faithfulness
employee-handbook-g-eval
employee-handbook-contains
employee-handbook-exact-match
```

Hasil yang benar:

```text
Cases: 6 total / 6 pass / 0 fail / 0 invalid
Metrics: 6 total / 6 pass / 0 fail / 0 invalid
```

Arti singkat:

- `PASS`: case berhasil.
- `FAIL`: jawaban belum sesuai.
- `INVALID`: metric gagal jalan, biasanya config judge/model/context salah.

Arti metric:

- `relevancy`: jawaban menjawab pertanyaan.
- `faithfulness`: jawaban didukung evidence handbook.
- `gEval`: judge mengecek kualitas jawaban.
- `contains`: jawaban berisi keyword penting.
- `exactMatch`: jawaban harus sama persis.

Perubahan sampai 100% pass:

- Judge metric memakai `OPENAI_JUDGE_COMPLETION_API="responses"`.
- Request judge tidak mengirim `temperature` karena GPT-5 tidak mendukung parameter itu.
- Prompt eval dibuat lebih ringkas.
- Beberapa expected output dibuat lebih jelas.
- Exact match hanya dipakai untuk case `Reply exactly`.

## Menjalankan Project Setelah Clone/Fork Dari GitHub

Pakai bagian ini kalau folder project sudah ada.

### 1. Clone atau Fork Repo

Clone repo:

```powershell
git clone <url-repo>
cd anvia-rag-evals-main
```

Jika memakai folder `assignment-code`, masuk ke folder itu:

```powershell
cd assignment-code
```

### 2. Install Dependency

```powershell
pnpm.cmd install
```

### 3. Siapkan Environment Variables

```powershell
Copy-Item .env.example .env
```

Isi `.env` terutama:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_JUDGE_MODEL`
- `OPENAI_JUDGE_COMPLETION_API`
- `ANVIA_LENS_BASE_URL`
- `ANVIA_LENS_PUBLIC_KEY`
- `ANVIA_LENS_SECRET_KEY`

Jika memakai official OpenAI, `OPENAI_BASE_URL` boleh kosong.

### 4. Jalankan Database, Redis, Dan Qdrant

```powershell
docker compose -f docker-compose.dev.yml up -d db qdrant
```

Redis tidak dipakai di project ini.

### 5. Setup Database

```powershell
pnpm.cmd db:generate
pnpm.cmd db:migrate
```

### 6. Jalankan App Dan Worker

```powershell
pnpm.cmd ingest:handbook
pnpm.cmd dev
```

Worker tidak diperlukan.

### 7. Buka Aplikasi

Buka app:

```text
http://localhost:3000
```

Buka Anvia Lens jika sudah jalan:

```text
http://localhost:8080
```

Run eval:

```powershell
pnpm.cmd eval
```

Di Lens, lihat eval run:

- `employee-handbook-relevancy`
- `employee-handbook-faithfulness`
- `employee-handbook-g-eval`
- `employee-handbook-contains`
- `employee-handbook-exact-match`

### 8. Cek Project

```powershell
pnpm.cmd build
pnpm.cmd eval
```

Common errors:

- `pnpm.ps1 cannot be loaded`: gunakan `pnpm.cmd`.
- `OPENAI_API_KEY` kosong: isi `.env`.
- `DATABASE_URL` error: pastikan Docker `db` hidup.
- Qdrant kosong: jalankan `pnpm.cmd ingest:handbook`.
- `No data extracted`: pastikan `OPENAI_JUDGE_COMPLETION_API="responses"`.
- Lens error: cek Lens URL dan keys.
