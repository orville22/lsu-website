import Link from 'next/link';
import { lessonPresentation } from '@/lib/topic-presentation';
import { TopicArt } from './brand/topic-art';
import { ArrowUpRight, BookOpen, Clock3, ChevronRight } from 'lucide-react';
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkText,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="muted">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="text-link">
          {linkText || 'Explore all'} <ArrowUpRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function DraftNotice({ variant = 'demo' }: { variant?: 'demo' | 'preview' | 'review' }) {
  return (
    <div className="draft-notice" role="note">
      <span className="status-dot" />
      {variant === 'demo' ? (
        <span>
          <strong>Demonstration content.</strong> AI-generated draft awaiting scientific review. For
          testing the platform; not approved teaching material.
        </span>
      ) : variant === 'review' ? (
        <span>
          <strong>In review.</strong> Only volunteer reviewers can see this lesson, and it may
          change before it’s published. Please don’t share it.
        </span>
      ) : (
        <span>
          <strong>Unpublished preview.</strong> Only signed-in administrators can see this page.
        </span>
      )}
    </div>
  );
}
/** Shown on public lessons while the volunteer review programme runs. */
export function EarlyVersionNotice() {
  return (
    <div className="early-notice" role="note">
      <span className="early-pill">Early version</span>
      <span>
        Lessons on this site are being reviewed by laboratory scientists and students.{' '}
        <Link className="text-link" href="/review">
          Volunteer to review
        </Link>
      </span>
    </div>
  );
}
export function ShortLessonNotice() {
  return (
    <div className="short-notice" role="note">
      <span className="short-pill">Short lesson</span>
      <span>
        This is a concise version covering the essentials. The full lesson is in development and
        will replace this page when it’s ready.
      </span>
    </div>
  );
}
/** Announced lessons: titles only, never linked, so there are no dead ends. */
export function UpcomingList({
  items,
  showCategory = true,
}: {
  items: { id: string; title: string; category: { name: string } }[];
  showCategory?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className="upcoming" aria-labelledby="upcoming-heading">
      <p className="eyebrow">In development</p>
      <h2 id="upcoming-heading">Coming next</h2>
      <ul>
        {items.map((l) => (
          <li key={l.id}>
            <span className="upcoming-title">{l.title}</span>
            {showCategory && <span className="small-label">{l.category.name}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {items.map((item, i) => (
        <span key={i}>
          <ChevronRight size={12} />
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function LessonCard({
  lesson,
}: {
  lesson: {
    title: string;
    description: string;
    readingMinutes: number;
    difficulty: string;
    status: string;
    depth?: string;
    category: { name: string; slug?: string };
    url: string;
  };
}) {
  const topic = lessonPresentation(lesson);
  return (
    <Link href={lesson.url} className={`lesson-card topic-${topic.tone}`}>
      <div className="lesson-art">
        <TopicArt kind={topic.artwork} />
      </div>
      <div className="lesson-card-body">
        <div className="card-top">
          <span className="small-label">{lesson.category.name}</span>
          <ArrowUpRight size={18} />
        </div>
        <h3>{lesson.title}</h3>
        <p>{lesson.description}</p>
        <div className="card-meta">
          <span>
            <BookOpen size={14} />
            {lesson.difficulty.toLowerCase()}
          </span>
          <span>
            <Clock3 size={14} />
            {lesson.readingMinutes} min
          </span>
          {lesson.depth === 'SHORT' && <span className="short-pill">Short lesson</span>}
          {lesson.status !== 'PUBLISHED' && <span className="draft-pill">Unpublished</span>}
        </div>
      </div>
    </Link>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
    </div>
  );
}
