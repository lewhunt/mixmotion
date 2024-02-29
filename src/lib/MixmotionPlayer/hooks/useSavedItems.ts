import { useCallback } from "react";

const savedItemsKey = "saved_items";

type Item = {
  key: string;
  // Add other properties based on your requirements
};

const getSavedItems = <T extends Item>(): T[] => {
  const value = window.localStorage.getItem(savedItemsKey);
  if (!value) return [];
  return JSON.parse(value);
};

const setSavedItems = <T extends Item>(items: T[]) =>
  window.localStorage.setItem(savedItemsKey, JSON.stringify(items));

const isSavedItem = <T extends Item>(currentItemId: string): boolean => {
  if (!currentItemId) return false;
  return getSavedItems<T>().some((item) => item.key === currentItemId);
};

export const useSavedItems = <T extends Item>() => {
  const updateSavedItems = useCallback((currentItem: T) => {
    let items = [...getSavedItems<T>()];

    const savedItemIndex = items.findIndex(
      (item) => item.key === currentItem.key
    );

    savedItemIndex > -1
      ? items.splice(savedItemIndex, 1)
      : (items = [...getSavedItems<T>(), currentItem]);

    setSavedItems<T>(items);
  }, []);

  return { getSavedItems, updateSavedItems, isSavedItem };
};
