// Faixa de texto em rolagem contínua (estilo editorial). CSS-only.
export default function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i} className="marquee-item">
            {t}
            <span className="marquee-dot">✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}
