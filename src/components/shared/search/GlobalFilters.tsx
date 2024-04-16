'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { GlobalSearchFilters } from '@/constants/filters';
import { formUrlQuery } from '@/lib/utils';

const GlobalFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get('type');

  const [isActive, setIsActive] = useState(typeParam || '');

  const handleTypeClick = (type: string) => {
    if (isActive === type) {
      setIsActive('');
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'type',
        value: null,
      });

      router.push(newUrl, { scroll: false });
    } else {
      setIsActive(type);
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'type',
        value: type.toLowerCase(),
      });

      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="flex items-center gap-5 px-5">
      <p className="text-dark400_light900 body-medium">Type: </p>
      <div className="flex gap-3">
        {GlobalSearchFilters.map((item) => (
          <button
            type="button"
            key={item.value}
            className={`light-border-2 small-medium rounded-2xl px-5 py-2 capitalize dark:text-light-800 dark:hover:text-primary-500 ${isActive === item.value ? 'bg-primary-500 text-light-900' : 'bg-light-700 text-dark-400 hover:text-primary-500 dark:bg-dark-500'}`}
            onClick={() => handleTypeClick(item.value)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};
export default GlobalFilters;
