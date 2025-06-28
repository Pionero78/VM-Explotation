
import { useCallback } from 'react';
import { Person } from '@/types';

export const useListReordering = (
  items: Person[],
  onReorder: (newOrder: Person[]) => void
) => {
  const moveUp = useCallback((index: number) => {
    if (index > 0) {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      onReorder(newItems);
    }
  }, [items, onReorder]);

  const moveDown = useCallback((index: number) => {
    if (index < items.length - 1) {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      onReorder(newItems);
    }
  }, [items, onReorder]);

  return {
    moveUp,
    moveDown
  };
};
