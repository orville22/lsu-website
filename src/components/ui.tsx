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
export function DraftNotice() {
  return (
    <div className="draft-notice" role="note">
      <span className="status-dot" />
      <span>
        <strong>Demonstration content.</strong> AI-generated draft awaiting scientific review. For
        testing the platform; not approved teaching material.
      </span>
    </div>
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
          {lesson.status === 'DRAFT' && <span className="draft-pill">Draft demo</span>}
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
