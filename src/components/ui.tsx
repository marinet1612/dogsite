import { clsx } from 'clsx';

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card-muted">
      <div className="text-3xl font-black text-cocoa">{value}</div>
      <div className="mt-2 text-sm font-bold text-cocoa/80">{label}</div>
      <div className="mt-1 text-sm leading-6 text-cocoa/55">{hint}</div>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-cocoa/20 bg-white/50 p-8 text-center">
      <div className="text-lg font-black text-cocoa">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-cocoa/60">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function SoftTag({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'green' | 'blue' | 'orange' | 'purple' }) {
  const tones = {
    default: 'bg-white/80 text-cocoa border-cocoa/10',
    green: 'bg-mint/25 text-emerald-900 border-emerald-200/60',
    blue: 'bg-sky/25 text-sky-900 border-sky-200/60',
    orange: 'bg-paw/20 text-orange-950 border-orange-200/60',
    purple: 'bg-lavender/35 text-purple-950 border-purple-200/60'
  };
  return <span className={clsx('inline-flex rounded-full border px-3 py-1 text-xs font-bold', tones[tone])}>{children}</span>;
}
