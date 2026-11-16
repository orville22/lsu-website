import Papa from 'papaparse';
import { db } from '@/lib/db';
import { errorResponse, requireAdmin } from '@/lib/security';
export const dynamic = 'force-dynamic';

/** Confirmed subscribers as CSV, for backups or moving to a newsletter tool. */
export async function GET() {
  try {
    await requireAdmin();
    const rows = await db.subscriber.findMany({
      where: { status: 'CONFIRMED' },
      orderBy: { confirmedAt: 'asc' },
      select: { email: true, source: true, consentText: true, createdAt: true, confirmedAt: true },
    });
    const csv = Papa.unparse(
      rows.map((r) => ({
        email: r.email,
        source: r.source,
        signed_up_at: r.createdAt.toISOString(),
        confirmed_at: r.confirmedAt?.toISOString() ?? '',
        consent_text: r.consentText,
      })),
      { escapeFormulae: true },
    );
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lsu-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
