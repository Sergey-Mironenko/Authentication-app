import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { reset, clearCredentials } from "./api/requests";
import { actions as resetingUserActions } from './features/resetingUser';
import { useAppSelector } from './app/hooks';
import { useLoading } from './utils/hooks';
import { Timer } from './types/Timer';

export const Reset = () => {
  const dispatch = useDispatch();
  const { resetingUser } = useAppSelector(state => state.resetingUser);
  const removeResetingUser = useCallback(() => dispatch(resetingUserActions.removeResetingUser()), [dispatch]);
  const instructions = 'Please enter your new password and repeat it.';
  const successText = 'Password was reseted'
  const [text, setText] = useState('P');
  const [firstPassword, setFirstPassword] = useState('');
  const [secondPassword, setSecondPassword] = useState('');
  const [isFirstPasswordVisible, setIsFirstPasswordVisible] = useState(false);
  const [isSecondPasswordVisible, setIsSecondPasswordVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReseted, setIsReseted] = useState(false);
  let timer1 = useRef<Timer | null>(null);
  let timer2 = useRef<Timer | null>(null);
  let interval = useRef<Timer | null>(null);
  const [message, setMessage] = useLoading(interval, '');
    
  const handleMessage = (errorMessage: string) => {
    for (let i = 1; i <= errorMessage.length + 1 ; i++) {
      timer2.current = setTimeout(() => {
        setMessage(errorMessage.slice(0, i));
      }, (i * 25))
    }
  };

  const handleReset = async () => {
    setIsLoading(true);

    try {
      if (resetingUser) {
        await clearCredentials();

        await reset(resetingUser.email, firstPassword);
    
        setIsReseted(true);
        handleMessage(successText);
      }
    } catch (e: any) {
      if (e.response) {
        switch (e.response.status) {
          case 404:
            removeResetingUser();
            break;
          default:
            handleMessage(e.response.data.message);
            break;
         }
       } else {
        handleMessage(e.message);
      }
    } finally {
      setIsLoading(false);
      clearInterval(interval.current as Timer);
      clearTimeout(timer2.current as Timer);
    }
  };
    
  const onReset = () => {
    if (!firstPassword) {
      handleMessage('Please enter new password');
    } else if (!secondPassword) {
      handleMessage('Please repeat new password');
    } else if (firstPassword !== secondPassword) {
      handleMessage('Passwords do not match');
    } else {
      handleReset();
    }
  };
    
  useEffect(() => {
    setIsSectionVisible(true);

    if (!isReseted) {
      for (let i = 2; i <= instructions.length + 28 ; i++) {
        timer1.current = setTimeout(() => {
          if (i <= instructions.length) {
            setText(instructions.slice(0, i));
          } else if (i === instructions.length + 7) {
            setIsFirstPasswordVisible(true);
          } else if (i === instructions.length + 14) {
            setIsSecondPasswordVisible(true);
          } else if (i === instructions.length + 28) {
            setIsButtonVisible(true)
          }
        }, (i * 10))
      }
    } else {
      for (let i = 2; i <= instructions.length; i++) {
        timer1.current = setTimeout(() => {
          setText(successText.slice(0, i));
        }, (i * 10))
      }
    }
 
    return () => {
      clearTimeout(timer1.current as Timer);
      clearTimeout(timer2.current as Timer);
    };
  }, [isReseted]);
   
  useEffect(() => {
    if (isLoading) {
      setMessage('...');
    }
  }, [isLoading, setMessage]);

  useEffect(() => {
    return () => {
      removeResetingUser();
    };
  }, [removeResetingUser]);
    
  return (
    <section className="section">
      {isReseted && (
        <>
          <h4 className="reset">{text}</h4>

          <div className="section__container section__container--reset">
            <NavLink
              to="/login"
              className={classNames(
                'section__button',
                { 'section__button--enabled': isButtonVisible},
                { 'section__button--disabled': isLoading },
              )}
              onClick={(event) => {
                if (isLoading) {
                  event.preventDefault();
                }
              }}
            >
              Sign in
            </NavLink>
          </div>
        </>
      )}

      {!isReseted && (
        <>
          <div className='section__field'>
            <div className='section__field-container'>
              <NavLink
                to="/verify"
                className={classNames(
                  'section__button',
                  'section__button--back',
                  { 'section__button--enabled': isSectionVisible},
                  { 'section__button--disabled': isLoading },
                )}
                onClick={(event) => {
                  if (isLoading) {
                    event.preventDefault();
                  }
                }}
              >
                {'<-'}
              </NavLink>
 
              <span className='section__title'>RESET PASSWORD</span>
            </div>
     
            <p className='section__text'>
              {text}
            </p>
     
            <input
              className={classNames(
                'section__input',
                { 'section__input--enabled': isFirstPasswordVisible && !isReseted},
                { 'section__input--disabled': isLoading},
              )}
              type="password"
              placeholder='Enter new password.'
              value={firstPassword}
              disabled={isLoading}
              onChange={(event) => {
                if (firstPassword.length <= 20 && event.target.value.length <= 20) {
                  setFirstPassword(event.target.value);
                  setMessage('');
                }
              }}
            />
                  
            <input
              className={classNames(
                'section__input',
                { 'section__input--enabled': isSecondPasswordVisible && !isReseted},
                { 'section__input--disabled': isLoading},
              )}
              type="password"
              placeholder='Repeat new password.'
              value={secondPassword}
              disabled={isLoading}
              onChange={(event) => {
                if (firstPassword.length <= 20 && event.target.value.length <= 20) {
                  setSecondPassword(event.target.value);
                  setMessage('');
                }
              }}
            />
          </div>
      
          <div className="section__container">
            <button
              className={classNames(
                'section__button',
                { 'section__button--enabled': isButtonVisible},
                { 'section__button--disabled': isLoading},
              )}
              disabled={isLoading}
              onClick={onReset}
            >
              Submit
            </button>
 
            <div
              className={classNames(
                'section__error',
                { 'section__error--enabled': message || isLoading}
              )}
            >
              {`>${message}<`}
            </div>
          </div>
        </>
      )}
    </section>
  )
};
  