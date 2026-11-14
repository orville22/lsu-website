// Presentation only: keep the established taxonomy and content model unchanged.
export type TopicArtwork = 'tubes' | 'ions' | 'photometry' | 'qc' | 'cardiac' | 'immunoassay';
export type TopicTone = 'cobalt' | 'tomato' | 'mustard' | 'green';
const topics: Record<string, { tone: TopicTone; artwork: TopicArtwork }> = {
  foundations: { tone: 'green', artwork: 'tubes' },
  electrolytes: { tone: 'cobalt', artwork: 'ions' },
  'renal-function': { tone: 'cobalt', artwork: 'ions' },
  'liver-function': { tone: 'tomato', artwork: 'tubes' },
  'carbohydrate-metabolism': { tone: 'mustard', artwork: 'tubes' },
  lipids: { tone: 'mustard', artwork: 'photometry' },
  'cardiac-biomarkers': { tone: 'cobalt', artwork: 'cardiac' },
  endocrinology: { tone: 'green', artwork: 'immunoassay' },
  proteins: { tone: 'cobalt', artwork: 'photometry' },
  toxicology: { tone: 'tomato', artwork: 'tubes' },
  'analytical-techniques': { tone: 'tomato', artwork: 'photometry' },
  'quality-control': { tone: 'mustard', artwork: 'qc' },
  preanalytical: { tone: 'green', artwork: 'tubes' },
};
export function topicPresentation(category: { slug?: string; name?: string }) {
  if (category.slug && topics[category.slug]) return topics[category.slug];
  const name = category.name?.toLowerCase() || '';
  if (/electrolyte|acid|renal/.test(name)) return topics.electrolytes;
  if (/quality|validation/.test(name)) return topics['quality-control'];
  if (/analytical technique|instrument|lipid|protein/.test(name))
    return topics['analytical-techniques'];
  if (/cardiac|troponin/.test(name)) return topics['cardiac-biomarkers'];
  if (/endocrin/.test(name)) return topics.endocrinology;
  return topics.foundations;
}

export function lessonPresentation(lesson: {
  title: string;
  category: { slug?: string; name?: string };
}) {
  const topic = topicPresentation(lesson.category);
  const title = lesson.title.toLowerCase();
  const artwork: TopicArtwork = /immunoassay/.test(title)
    ? 'immunoassay'
    : /ion|sodium|potassium|electrolyte|\bise\b/.test(title)
      ? 'ions'
      : /quality|control|precision|bias/.test(title)
        ? 'qc'
        : /photometr|spectro|absorbance/.test(title)
          ? 'photometry'
          : /cardiac|troponin/.test(title)
            ? 'cardiac'
            : topic.artwork;
  return { ...topic, artwork };
}
