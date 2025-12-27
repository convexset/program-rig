interface YouTubeEmbedProps {
  videoId: string;
  style?: 'normal' | 'rest';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function YouTubeEmbed({ videoId, style = 'normal' }: YouTubeEmbedProps) {
  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '800px', 
      margin: '0.5rem auto',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <div style={{ position: 'relative', paddingBottom: '200px', height: 0, overflow: 'hidden' }}>
        <iframe
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            maxHeight: '200px',
            border: 'none',
          }}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={`YouTube video ${videoId}`}
        />
      </div>
    </div>
  );
}
