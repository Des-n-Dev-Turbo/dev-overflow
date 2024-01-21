'use client';
import { HomePageFilters } from '@/constants/filters';
import { Button } from '../ui/button';

const HomeFilters = () => {
  const isActive = 'newest';

  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex ">
      {HomePageFilters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => {}}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${isActive === filter.value ? 'bg-primary-100 text-primary-500 dark:bg-dark-400 dark:text-primary-500' : 'bg-light-800 text-light-500 dark:bg-dark-300  dark:text-light-500 '}`}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;
