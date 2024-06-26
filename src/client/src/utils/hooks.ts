import { useCallback, useState } from "react";

export const useLoading = (interval: any, text = ''): [string, (value: string) => void] => {
  const [message, set] = useState(text);

  const setMessage = useCallback((str: string) => {
    if (str === '...') {
      let count = 1;
      
      set('.');

      interval.current = setInterval(() => {
        count++;
    
        count > 3 && (count = 1);

        set(str.slice(0, count));
      }, 500);
    } else {
      set(str);
    }
  }, [interval])

  return [message, setMessage];
};
