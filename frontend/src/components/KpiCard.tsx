interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'primary' | 'green' | 'red' | 'amber';
}

const accentClasses: Record<NonNullable<KpiCardProps['accent']>, string> = {
  primary: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
  green: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  red: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
};

export default function KpiCard({ label, value, icon, accent = 'primary' }: KpiCardProps) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
      {icon && (
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${accentClasses[accent]}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
