interface Row {
  label: string;
  value: number;
  barClass: string;
}

export function DistributionCard({ title, rows }: { title: string; rows: Row[] }) {
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  return (
    <section className="card p-5" aria-labelledby={`dist-${title}`}>
      <h2 id={`dist-${title}`} className="text-base font-semibold">{title}</h2>
      <ul className="mt-4 space-y-4">
        {rows.map((row) => {
          const pct = total === 0 ? 0 : Math.round((row.value / total) * 100);
          return (
            <li key={row.label}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span>{row.label}</span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">{row.value} ({pct}%)</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="img" aria-label={`${row.label}: ${row.value} of ${total} tasks`}>
                <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
