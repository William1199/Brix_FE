import { useEffect, useState } from "react";

const useDebounce = (value, delay) => {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounceValue(value), delay);

    return () => clearTimeout(id);
  }, [value]);

  return debounceValue;
};

export default useDebounce;
