import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { activate } from "./api/requests";
import { actions as logedUserActions } from './features/logedUser';
import { useLoading } from './utils/hooks';
import { User } from "./types/User";
import { Timer } from "./types/Timer";

export const Activation = () => {
  const dispatch = useDispatch();
  const setLogedUser = useCallback((user: User) => dispatch(logedUserActions.setLogedUser(user)), [dispatch]);
  const [isActivating, setIsActivating] = useState(false);
  const { pathname } = useLocation();
  const token = pathname.split('/')[2];
  let timer1 = useRef<Timer | null>(null);
  let interval = useRef<Timer | null>(null);
  const [message, setMessage] = useLoading(interval, '');
  
  const handleActivation = useCallback(async () => {
    const handleMessage = async (str: string) => {
      clearInterval(interval.current as Timer)
      setMessage(str[0]);
  
      for (let i = 1; i <= str.length + 1; i++) {
        timer1.current = setTimeout(() => {
          setMessage(str.slice(0, i));
        }, (i * 40))
      }
    };

    setIsActivating(true);

    try {
      const { user, accessToken } = await activate(token);

      localStorage.setItem('accessToken', accessToken);
      setLogedUser(user);  
    } catch (e: any) {
      if (e.response) {
        handleMessage(e.response.data.message);
      } else {
        handleMessage(e.message);
      }
    } finally {
      clearTimeout(timer1.current as Timer);
      setIsActivating(false);
    }
  }, [token, setMessage, setIsActivating, setLogedUser]);

  useEffect(() => {
    if (isActivating) {
      setMessage('...');
    }
  }, [isActivating, setMessage])

  useEffect(() => {
    handleActivation();
    
    return clearTimeout(timer1.current as Timer);
  }, [handleActivation, token]);

  return (
    <h4 className="activation">{isActivating ? `>Activating${message}<` : `>${message}<`}</h4>
  )
};
