import React from 'react';
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
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/60 text-slate-400 border border-slate-800">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-200">{title}</h3>
      <p className="mt-2 max-w-sm text-xs text-slate-500 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="agentik-button mt-6 text-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
