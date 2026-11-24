import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isStoredValue: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue === null) return initialValue;

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(storedValue);
    } catch (error) {
      throw new Error(`La valeur enregistrée pour « ${key} » est invalide.`, {
        cause: error,
      });
    }

    if (!isStoredValue(parsedValue)) {
      throw new Error(`La valeur enregistrée pour « ${key} » est invalide.`);
    }

    return parsedValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
