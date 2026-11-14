import Link from 'next/link';
import katex from 'katex';
import { db } from '@/lib/db';
import { lessonUrl } from '@/lib/content';
import { blockSchema, referenceSchema } from '@/lib/validation';
import { DraftNotice, Breadcrumbs } from './ui';
import { Video } from './video';
import { lessonPresentation } from '@/lib/topic-presentation';
import { TopicArt } from './brand/topic-art';
import { MascotArtwork } from './brand/mascot-artwork';
import { ArrowUpRight } from 'lucide-react';
import { z } from 'zod';
export async function Lesson({
  lesson,
  demo,
}: {
  lesson: NonNullable<Awaited<ReturnType<typeof fetchLesson>>>;
  demo: boolean;
}) {
  const topic = lessonPresentation(lesson);
  const blocks = z.array(blockSchema).parse(lesson.blocks);
  const refs = z.array(referenceSchema).parse(lesson.references);
  const related = await db.lesson.findMany({
    where: {
      id: { not: lesson.id },
      categoryId: lesson.categoryId,
      ...(demo
        ? { isDemo: true, status: 'DRAFT' }
        : { status: 'PUBLISHED', reviewedAt: { not: null } }),
    },
    include: { category: { include: { discipline: true } } },
    take: 3,
  });
  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { label: 'Learn', href: '/learn' },
          { label: lesson.category.name, href: `/learn?category=${lesson.category.slug}` },
          { label: lesson.title },
        ]}
      />
      <div className={`article-layout topic-${topic.tone}`}>
        <aside className="article-sidebar">
          <p>In this lesson</p>
          <a href="#objectives">Learning objectives</a>
          {blocks.map((b) => (
            <a key={b.id} href={`#${b.id}`}>
              {'heading' in b
                ? b.heading
                : b.type === 'equation'
                  ? 'Equation'
                  : b.type === 'table'
                    ? b.caption
                    : b.type === 'video'
                      ? b.title
                      : 'Illustration'}
            </a>
          ))}
          <a href="#takeaways">Key takeaways</a>
          <a href="#practice">Test your understanding</a>
          <a href="#references">References</a>
        </aside>
        <article className="article">
          {demo && <DraftNotice />}
          <div className="lesson-visual">
            <TopicArt kind={topic.artwork} />
          </div>
          <p className="eyebrow">
            {lesson.category.discipline.name} / {lesson.category.name}
          </p>
          <h1>{lesson.title}</h1>
          <div className="article-meta">
            <span>{lesson.difficulty.toLowerCase()}</span>
            <span>{lesson.readingMinutes} minute read</span>
            <span>{lesson.subtopic}</span>
            <span>
              {lesson.reviewedAt
                ? `Reviewed ${lesson.reviewedAt.toLocaleDateString('en-AU', { timeZone: 'UTC' })}`
                : 'Scientific review pending'}
            </span>
          </div>
          <p className="lead">{lesson.description}</p>
          <section className="objectives" id="objectives">
            <h2>What you’ll take away</h2>
            <ul>
              {lesson.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>
          {blocks.map((b) => (
            <section
              id={b.id}
              key={b.id}
              className={`content-block ${b.type === 'callout' ? 'callout' : ''}`}
            >
              {b.type === 'text' || b.type === 'callout' ? (
                <>
                  <h2>{b.heading}</h2>
                  <p>{b.text}</p>
                </>
              ) : b.type === 'equation' ? (
                <div
                  className="equation"
                  dangerouslySetInnerHTML={{
                    __html: katex.renderToString(b.latex, {
                      throwOnError: false,
                      trust: false,
                      strict: 'error',
                      displayMode: true,
                      maxExpand: 100,
                      maxSize: 10,
                    }),
                  }}
                />
              ) : b.type === 'table' ? (
                <div className="table-scroll">
                  <table>
                    <caption>{b.caption}</caption>
                    <thead>
                      <tr>
                        {b.headers.map((h, i) => (
                          <th key={i} scope="col">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r, i) => (
                        <tr key={i}>
                          {r.map((c, j) => (
                            <td key={j}>{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : b.type === 'image' ? (
                <figure>
                  <img src={b.url} alt={b.alt} loading="lazy" />
                  <figcaption>{b.caption}</figcaption>
                </figure>
              ) : b.type === 'video' ? (
                <Video id={b.youtubeId} title={b.title} />
              ) : null}
            </section>
          ))}
          <section className="objectives takeaways" id="takeaways">
            <MascotArtwork moment="tip" />
            <h2>Key takeaways</h2>
            <ul>
              {lesson.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
          <section className="test-understanding" id="practice">
            <h2>Test your understanding.</h2>
            <p>
              Connect this concept with questions from the same topic.{' '}
              {demo
                ? 'This practice uses unreviewed demonstration questions.'
                : 'Feedback and explanations appear after submission.'}
            </p>
            <Link
              className="button button-light"
              href={`/practice?category=${lesson.categoryId}${demo ? '&demo=true' : ''}`}
            >
              Practise this topic <ArrowUpRight size={16} />
            </Link>
          </section>
          <section id="references" className="references">
            <h2>References & further reading</h2>
            {refs.length ? (
              <ol>
                {refs.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      {r.title}
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">
                References must be added and verified before this draft can be published.
              </p>
            )}
          </section>
          {related.length > 0 && (
            <section className="references">
              <h2>{demo ? 'Related draft previews' : 'Related lessons'}</h2>
              {related.map((l) => (
                <p key={l.id}>
                  <Link className="text-link" href={lessonUrl(l)}>
                    {l.title} <ArrowUpRight size={13} />
                  </Link>
                </p>
              ))}
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
export function fetchLesson(slug: string, demo: boolean) {
  return db.lesson.findFirst({
    where: {
      slug,
      ...(demo
        ? { isDemo: true, status: 'DRAFT' as const }
        : { status: 'PUBLISHED' as const, reviewedAt: { not: null } }),
    },
    include: { category: { include: { discipline: true } } },
  });
}
