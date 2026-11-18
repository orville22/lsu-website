import { z } from 'zod';
import Papa from 'papaparse';
import { db } from '@/lib/db';
import { assertOrigin, errorResponse, readJson, requireAdmin } from '@/lib/security';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    await requireAdmin();
    const { id, action } = z
      .object({ id: z.string().min(1).max(64), action: z.enum(['resolve', 'reopen', 'delete']) })
      .parse(await readJson(req));
    if (action === 'delete') await db.feedback.delete({ where: { id } });
    else
      await db.feedback.update({
        where: { id },
        data:
          action === 'resolve'
            ? { status: 'RESOLVED', resolvedAt: new Date() }
            : { status: 'OPEN', resolvedAt: null },
      });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

/** All feedback as CSV, for working through it in a spreadsheet. */
export async function GET() {
  try {
    await requireAdmin();
    const rows = await db.feedback.findMany({
      orderBy: { createdAt: 'asc' },
      include: { reviewer: { select: { name: true, role: true } } },
    });
    const csv = Papa.unparse(
      rows.map((r) => ({
        sent_at: r.createdAt.toISOString(),
        kind: r.kind,
        status: r.status,
        page: r.path,
        page_title: r.pageTitle,
        reviewer: r.reviewer?.name ?? '',
        reviewer_role: r.reviewer?.role ?? '',
        clarity: r.clarity ?? '',
        level: r.level ?? '',
        accuracy: r.accuracy,
        illustrations: r.illustrations,
        missing_or_confusing: r.missing,
        comment: r.comment,
      })),
      { escapeFormulae: true },
    );
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lsu-feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
