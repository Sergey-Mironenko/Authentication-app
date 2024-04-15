import { useEffect, useRef } from 'react';
import { useLoading } from './utils/hooks';
import { Timer } from './types/Timer';

export const Loader = () => {
  const interval = useRef<Timer | null>(null);
  const [text, setText] = useLoading(interval, '');

  useEffect(() => {
    const intervalToClear = interval.current;
    setText('...');

    return () => clearInterval(intervalToClear as Timer);
  }, [setText]);

  return (
    <div className="main__loader">
      <h1>{text}</h1>
    </div>
  )
}