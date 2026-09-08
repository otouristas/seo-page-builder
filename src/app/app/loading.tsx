export default function Loading() {
  return (
    <main
      id="main"
      className="container"
      style={{ paddingTop: 60 }}
      aria-label="Loading workspace"
    >
      <div className="skeleton" />
      <div className="skeleton" />
      <p>Loading your workspace…</p>
    </main>
  );
}
