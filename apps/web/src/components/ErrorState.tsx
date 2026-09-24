import { CircleAlert } from 'lucide-react';

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="error-state" role="alert">
      <CircleAlert size={20} aria-hidden="true" />
      <div>
        <strong>API no disponible</strong>
        <span>{message}. Verifica que el backend esté ejecutándose en el puerto 3000.</span>
      </div>
    </div>
  );
}
