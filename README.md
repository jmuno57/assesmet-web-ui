# Kata Full Stack — Front

SPA React + TypeScript para la plataforma de evaluaciones técnicas.

## Cómo correrlo

```bash
nvm use
npm install
npm run dev
```

Usuarios mock:

- Admin: `admin@kata.com` / `Admin123!`
- Candidato: `candidate@kata.com` / `Candidato123!`

## Decisiones

- JWT en `Authorization: Bearer` en **todos** los requests (listo para Lambda Authorizer de API Gateway).
- Sesión en `sessionStorage` (Zustand persist). Dynamo queda en el back; el mock simula la sesión activa.
- Rutas protegidas: sin token → `/login`. El rol del JWT cambia admin vs candidato.
- Inactividad de **5 minutos**: cierra sesión y borra credenciales del storage.
- Request/response van en envelope Base64 `{ payload }` con **un solo interceptor** (`src/lib/http.ts` + `src/lib/codec.ts`). Los servicios no cifran.
- Componentes presentacionales + hooks + pages. UI en SASS dark azul.
- Servicios mockeados con el mismo contrato HTTP del API futuro.
