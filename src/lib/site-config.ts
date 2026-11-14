/**
 * Launch switches. Sections stay out of navigation, the homepage and the sitemap
 * until they have real content, so visitors never land on an empty page.
 * Signed-in administrators can still open every section to preview it.
 */
export const siteConfig = {
  /** Published, reviewed questions needed before "Practice" appears in the navigation. */
  practiceMinQuestions: 20,
  /** Published questions a topic needs before lessons show "Practise this topic". */
  topicPracticeMinQuestions: 5,
  /** Turn on once a reviewed case study exists. */
  casesEnabled: false,
  /** Turn on once the first video is published. */
  watchEnabled: false,
  /** Public YouTube channel URL, shown in the navigation and footer when set. */
  youtubeUrl: null as string | null,
  /** Where visitors contact LSU (privacy requests, corrections). Shown in the footer and privacy page. */
  contactUrl: 'https://orvillemalijan.com',
  /** Date the privacy page last changed in substance. */
  privacyUpdated: '15 November 2026',
};
