type EmbedIframeProps = {
  src: string;
  title: string;
  height?: number;
};

export function EmbedIframe({ src, title, height = 4300 }: EmbedIframeProps) {
  return (
    <div style={{ marginTop: 24, marginBottom: 12 }}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        scrolling="auto"
        style={{
          width: "100%",
          height,
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          background: "#fff",
        }}
      />
    </div>
  );
}
