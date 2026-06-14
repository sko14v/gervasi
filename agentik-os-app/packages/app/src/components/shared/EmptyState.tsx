import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-radius-xl border border-dashed border-separator bg-tint/10 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tint/50 text-label-secondary border border-separator">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-title-3 text-label-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-callout text-label-secondary leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="agentik-button mt-6 text-caption-1"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
