'use client';

const getEmbedUrl = (url: string): string | null => {
  if (url.includes('vimeo.com')) {
    const videoId = url.split('/').pop();
    return `https://player.vimeo.com/video/${videoId}`;
  }
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId;
    if (url.includes('youtu.be')) {
      videoId = new URL(url).pathname.substring(1);
    } else {
      videoId = new URL(url).searchParams.get('v');
    }
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return null;
}

export default function TrailerEmbed({ url }: { url: string }) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return <p className="text-center text-muted-foreground">Trailer-URL wird nicht unterstützt.</p>;
  }
  
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-secondary">
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-0"
      ></iframe>
    </div>
  );
}
