export default function Loading() {
  return (
    <div className="container detail" aria-busy="true">
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--hero" />
      <div className="detail__grid">
        <div className="skeleton skeleton--panel" />
        <div className="skeleton skeleton--panel" />
      </div>
    </div>
  );
}
