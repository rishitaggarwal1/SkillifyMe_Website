import { useEffect, useState } from 'react';

// Local images under /assets/img have smaller .webp copies next to them (see public/assets/img).
const webpFor = (src) =>
  typeof src === 'string' && src.startsWith('/assets/img/') && /\.(png|jpe?g)$/i.test(src)
    ? src.replace(/\.(png|jpe?g)$/i, '.webp')
    : null;

// Drop-in <img> replacement for public pages:
// - uses the .webp copy when there is one, falling back to the original if it is missing
// - loads lazily (only when scrolled near) unless `priority` is set for above-the-fold images
const Img = ({ src, onError, priority = false, loading, ...rest }) => {
  const [current, setCurrent] = useState(webpFor(src) || src);

  useEffect(() => setCurrent(webpFor(src) || src), [src]);

  const handleError = (e) => {
    if (current !== src) {
      setCurrent(src); // no .webp copy: use the original
      return;
    }
    onError?.(e);
  };

  return (
    <img
      src={current}
      loading={loading || (priority ? 'eager' : 'lazy')}
      decoding="async"
      fetchpriority={priority ? 'high' : undefined}
      onError={handleError}
      {...rest}
    />
  );
};

export default Img;
