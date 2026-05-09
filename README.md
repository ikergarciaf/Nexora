# Nexora — Software Clínico Inteligente

Plataforma SaaS para clínicas y profesionales de la salud. Agenda, historia clínica, facturación, e IA en una sola herramienta.

## Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + Vite
- **Backend:** Express + Prisma + PostgreSQL
- **Autenticación:** JWT + Google OAuth
- **IA:** Gemini API (Google AI)
- **Pagos:** Stripe
- **Email:** Nodemailer (SMTP)
- **Infraestructura:** Docker, CI/CD via GitHub Actions

## Requisitos

- Node.js 20+
- PostgreSQL 16+
- Una API key de Gemini (para funciones IA)

## Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión PostgreSQL |
| `JWT_SECRET` | Secreto para firmar JWTs |
| `GEMINI_API_KEY` | API key de Google Gemini |
| `STRIPE_SECRET_KEY` | API key de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret de Stripe |
| `SMTP_HOST/USER/PASS` | Configuración SMTP para emails |
| `VITE_GOOGLE_CLIENT_ID` | ID de cliente Google OAuth |

## Desarrollo

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run test` | Tests (vitest) |
| `npm run lint` | TypeScript check |
| `npm run db:migrate` | Ejecuta migraciones Prisma |
| `npm run seed` | Datos de prueba iniciales |
| `npm run start` | Inicia en producción |

## Producción

```bash
docker compose up -d
```

## Licencia

MIT — ver [LICENSE](LICENSE).
