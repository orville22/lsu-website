type ApprovedMascot = { src: string; alt: string; width: number; height: number };
/** Populate only after the founder supplies/approves the Lab Rat asset. */
export const approvedBrandAssets: { labRat: ApprovedMascot | null } = { labRat: null };
export function MascotArtwork({ moment }: { moment: 'welcome' | 'tip' | 'feedback' }) {
  const asset = approvedBrandAssets.labRat;
  if (!asset) return null;
  return (
    <img
      className={`lab-rat-artwork lab-rat-${moment}`}
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      loading="lazy"
    />
  );
}
