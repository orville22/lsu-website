import Link from 'next/link';
import katex from 'katex';
import { db } from '@/lib/db';
import { lessonUrl } from '@/lib/content';
import { blockSchema } from '@/lib/validation';
import { DraftNotice, Breadcrumbs, ShortLessonNotice } from './ui';
import { RichText, InlineText } from './rich-text';
import { ReferenceList, toReferences } from './reference-list';
import { siteState } from '@/lib/visibility';
import { Video } from './video';
import { lessonPresentation } from '@/lib/topic-presentation';
import { TopicArt } from './brand/topic-art';
import { MascotArtwork } from './brand/mascot-artwork';
import { ArrowUpRight } from 'lucide-react';
import { z } from 'zod';
export async function Lesson({
  lesson,
  preview,
}: {
  lesson: NonNullable<Awaited<ReturnType<typeof fetchLesson>>>;
  /** Administrator preview of an unpublished lesson. */
  preview: boolean;
}) {
  const topic = lessonPresentation(lesson);
  const blocks = z.array(blockSchema).parse(lesson.blocks);
  const refs = toReferences(lesson.references);
  const state = await siteState();
  // Topic practice is offered only when the topic has enough reviewed questions;
  // previews of AI demo drafts can still use the demo question set.
  const practiceHref = preview
    ? lesson.isDemo
      ? `/practice?category=${lesson.categoryId}&demo=true`
      : null
    : state.practiceCategoryIds.has(lesson.categoryId)
      ? `/practice?category=${lesson.categoryId}`
      : null;
  const related = await db.lesson.findMany({
    where: {
      id: { not: lesson.id },
      categoryId: lesson.categoryId,
      ...(preview
        ? { status: { in: ['DRAFT', 'IN_REVIEW'] } }
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
          {/* Contents lists headed sections only; equations, tables and media sit within them. */}
          {blocks.map((b) =>
            b.type === 'text' && b.heading ? (
              <a key={b.id} href={`#${b.id}`}>
                {b.heading}
              </a>
            ) : null,
          )}
          <a href="#takeaways">Key takeaways</a>
          {practiceHref && <a href="#practice">Test your understanding</a>}
          {refs.length > 0 && <a href="#references">References</a>}
        </aside>
        <article className="article">
          {preview && <DraftNotice variant={lesson.isDemo ? 'demo' : 'preview'} />}
          <div className="lesson-visual">
            <TopicArt kind={topic.artwork} />
          </div>
          <p className="eyebrow">
            {lesson.category.discipline.name} / {lesson.category.name}
          </p>
          <h1>{lesson.title}</h1>
          <div className="article-meta">
            {lesson.depth === 'SHORT' && <span className="short-pill">Short lesson</span>}
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
          {lesson.depth === 'SHORT' && <ShortLessonNotice />}
          <section className="objectives" id="objectives">
            <h2>What you’ll take away</h2>
            <ul>
              {lesson.objectives.map((o) => (
                <li key={o}>
                  <InlineText text={o} />
                </li>
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
                  {b.heading && <h2>{b.heading}</h2>}
                  <RichText text={b.text} />
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
                    <caption>
                      <InlineText text={b.caption} />
                    </caption>
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
                            <td key={j}>
                              <InlineText text={c} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : b.type === 'image' ? (
                <figure>
                  <img src={b.url} alt={b.alt} loading="lazy" />
                  <figcaption>
                    <InlineText text={b.caption} />
                  </figcaption>
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
                <li key={t}>
                  <InlineText text={t} />
                </li>
              ))}
            </ul>
          </section>
          {practiceHref && (
            <section className="test-understanding" id="practice">
              <h2>Test your understanding.</h2>
              <p>
                Connect this concept with questions from the same topic.{' '}
                {lesson.isDemo && preview
                  ? 'This practice uses unreviewed demonstration questions.'
                  : 'Feedback and explanations appear after submission.'}
              </p>
              <Link className="button button-light" href={practiceHref}>
                Practise this topic <ArrowUpRight size={16} />
              </Link>
            </section>
          )}
          <section id="references" className="references">
            <h2>References</h2>
            {refs.length ? (
              <ReferenceList references={refs} />
            ) : (
              <p className="muted">
                References must be added and verified before this lesson can be published.
              </p>
            )}
          </section>
          {related.length > 0 && (
            <section className="references">
              <h2>{preview ? 'Related unpublished lessons' : 'Related lessons'}</h2>
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
export function fetchLesson(slug: string, preview: boolean) {
  return db.lesson.findFirst({
    where: {
      slug,
      ...(preview
        ? { status: { in: ['DRAFT' as const, 'IN_REVIEW' as const] } }
        : { status: 'PUBLISHED' as const, reviewedAt: { not: null } }),
    },
    include: { category: { include: { discipline: true } } },
  });
}
