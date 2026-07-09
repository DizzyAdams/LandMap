import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Contact form sink. There is no external CRM wired yet, so we validate the
 * payload server-side and log it. The client treats any non-2xx as a failure,
 * which keeps the UI honest instead of faking success.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const mensagem = typeof body.mensagem === 'string' ? body.mensagem.trim() : '';

    if (!nome || !email || !mensagem) {
      return NextResponse.json(
        { ok: false, error: 'Campos obrigatórios ausentes.' },
        { status: 400 },
      );
    }

    // No backend yet — log server-side as a graceful sink.
    console.log('[contact] new message', { nome, email, telefone: body.telefone });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Requisição inválida.' }, { status: 400 });
  }
}
