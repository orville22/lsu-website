'use client';
import { useState } from 'react';
import { Play } from 'lucide-react';
export function Video({ id, title }: { id: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return loaded ? (
    <iframe
      className="video-embed"
      src={`https://www.youtube-nocookie.com/embed/${id}`}
      title={title}
      loading="lazy"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  ) : (
    <div className="video-placeholder">
      <Play size={28} style={{ margin: 'auto' }} />
      <p>{title}</p>
      <p>
        Loading this video connects to YouTube. No video request is made until you choose to load
        it.
      </p>
      <button className="button button-small" onClick={() => setLoaded(true)}>
        Load video
      </button>
    </div>
  );
}
