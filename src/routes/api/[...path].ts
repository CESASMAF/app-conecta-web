// Catch-all → monta o BFF Elysia dentro do SolidStart (fronteira BFF, ADR-0010).
// Toda requisição a /api/* delega ao app.fetch (a fronteira que o browser vê).
import type { APIEvent } from '@solidjs/start/server'
import { app } from '~/server/app'

const handler = ({ request }: APIEvent): Response | Promise<Response> => app.fetch(request)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
