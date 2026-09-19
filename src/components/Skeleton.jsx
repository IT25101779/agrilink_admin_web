export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-32 bg-slate-50 rounded" />
        </div>
        <div className="h-5 w-16 bg-slate-50 rounded-full" />
      </div>
      <div className="h-8 w-28 bg-slate-100 rounded mb-4" />
      <div className="h-9 w-full bg-slate-50 rounded-lg" />
    </div>
  );
}

export function SkeletonMetric() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse">
      <div className="h-3 w-24 bg-slate-100 rounded mb-3" />
      <div className="h-8 w-16 bg-slate-100 rounded" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-3"><div className="h-3 w-20 bg-slate-100 rounded" /></td>
      <td className="py-3"><div className="h-3 w-24 bg-slate-50 rounded" /></td>
      <td className="py-3"><div className="h-3 w-14 bg-slate-50 rounded" /></td>
      <td className="py-3"><div className="h-3 w-16 bg-slate-50 rounded" /></td>
      <td className="py-3"><div className="h-3 w-14 bg-slate-100 rounded-full" /></td>
    </tr>
  );
}
