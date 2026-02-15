'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminDatePicker({ selectedDate }: { selectedDate: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', newDate);
    router.replace(`?${params.toString()}`); // Use replace to avoid stacking history for every date change if scrolling, but push is fine too. Push is better for "Back" button.
  };

  return (
    <div className="flex flex-col">
        <label className="text-xs text-brand-muted mb-1">Manage Date</label>
        <input
        type="date"
        defaultValue={selectedDate}
        onChange={handleChange}
        className="bg-brand-beige border border-brand-text/10 rounded-lg px-3 py-2 text-sm h-12 w-full font-bold text-brand-text focus:outline-none focus:border-brand-orange cursor-pointer"
        />
    </div>
  );
}
