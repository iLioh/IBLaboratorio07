export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-stack" aria-label="Cargando contenido" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton" key={index} />
      ))}
    </div>
  );
}
