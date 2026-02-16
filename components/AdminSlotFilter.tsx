'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminSlotFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSlot = searchParams.get('slot') || 'All';
  const slots = ['All', '10PM-12AM', '12AM-2AM', '2AM-4AM'];

  const handleSlotChange = (slot: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slot === 'All') {
      params.delete('slot');
    } else {
      params.set('slot', slot);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 bg-light-beige p-2 rounded-xl border border-brand-text/5 w-fit">
      {slots.map((s) => (
        <button
          key={s}
          onClick={() => handleSlotChange(s)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            (currentSlot === s || (s === 'All' && !searchParams.get('slot')))
              ? 'bg-brand-orange text-white shadow-md'
              : 'text-brand-muted hover:bg-white hover:text-brand-text'
          }`}
        >
          {s === 'All' ? 'All Day' : s}
        </button>
      ))}
    </div>
  );
}
