interface StatusBadgeProps {
  tone: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  children: React.ReactNode;
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
