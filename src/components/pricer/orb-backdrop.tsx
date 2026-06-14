export function OrbBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
      <div className="orb-primary" />
      <div className="orb-secondary" />
    </div>
  );
}
