import Papa from 'papaparse';
import { z } from 'zod';
import { db } from '@/lib/db';
import { assertOrigin, errorResponse, readJson, requireAdmin } from '@/lib/security';
import { ALL_FEEDBACK_COLUMNS, type FeedbackAnswers } from '@/lib/reviewers';
export const dynamic = 'force-dynamic';

/** All reviewer feedback as CSV, one row per submission. */
export async function GET() {
  try {
    await requireAdmin();
    const rows = await db.feedback.findMany({
      orderBy: { createdAt: 'asc' },
      include: { reviewer: { select: { name: true, email: true, role: true } } },
    });
    const csv = Papa.unparse(
      rows.map((f) => {
        const a = (f.answers || {}) as FeedbackAnswers;
        const row: Record<string, string | number> = {
          submitted_at: f.createdAt.toISOString(),
          reviewer: f.reviewer?.name ?? (f.actor ? `Admin (${f.actor})` : 'Removed reviewer'),
          email: f.reviewer?.email ?? '',
          role: f.reviewer?.role ?? '',
          track: f.track,
          page: f.path,
        };
        for (const q of ALL_FEEDBACK_COLUMNS) {
          row[q.id] = a[q.id] ?? '';
          if (q.type === 'choice' && q.detail) row[`${q.id}_detail`] = a[`${q.id}Detail`] ?? '';
        }
        row.resolved = f.resolved ? 'yes' : 'no';
        return row;
      }),
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

/** Marks a piece of feedback as dealt with (or not). */
export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    await requireAdmin();
    const { id, resolved } = z
      .object({ id: z.string(), resolved: z.boolean() })
      .parse(await readJson(req));
    await db.feedback.update({ where: { id }, data: { resolved } });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
