import { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useAppSelector } from './app/hooks';
import { useLoading } from './utils/hooks';
import { clearCredentials, resetPassword, verifyPassword } from './api/requests';
import { actions as refreshErrorActions } from './features/refreshError';
import { Timer } from './types/Timer';

export const ChangePassword = () => {
  const dispatch = useDispatch();
  const { logedUser } = useAppSelector(state => state.logedUser);
  const handleRefreshFail = useCallback(() => dispatch(refreshErrorActions.handleRefreshFail()), [dispatch]);
  const instructions = 'Enter your old password first. Then enter new password and repeat it.';
  const [text, setText] = useState('E');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [isNameVisible, setIsNameVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
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

  const handleVerify = async () => {
    setIsLoading(true);
    
    try {
      if (logedUser) {
        await verifyPassword(logedUser.email, oldPassword);

        setIsVerified(true);
        handleMessage('Verified');
      }
    } catch (e: any) {
      if (e.response) {
        switch (e.response.status) {
          case 401:
            handleRefreshFail();
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

  const onVerify = () => {
    if (!oldPassword) {
      handleMessage('Please enter old password');
    } else {
      handleVerify();
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    
    try {
      if (logedUser) {
        await clearCredentials();

        await resetPassword(logedUser.email, newPassword);

        setOldPassword('');
        setNewPassword('');
        setRepeatedPassword('');
        handleMessage('Successfully reseted');
      }
    } catch (e: any) {
      if (e.response) {
        switch (e.response.status) {
          case 401:
            handleRefreshFail();
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
    if (newPassword) {
      handleMessage('Please enter new password');
    } else if (!repeatedPassword) {
      handleMessage('Please repeat new password');
    } else if (newPassword !== repeatedPassword) {
      handleMessage('Paswords do not match');
    } else {
      handleReset();
    }
  };

  useEffect(() => {
    setIsSectionVisible(true);

    for (let i = 2; i <= instructions.length + 14 ; i++) {
      timer1.current = setTimeout(() => {
        if (i <= instructions.length) {
          setText(instructions.slice(0, i));
        } else if (i === instructions.length + 7) {
          setIsNameVisible(true);
        } else if (i >= instructions.length + 14) {
          setIsButtonVisible(true);
        }
      }, (i * 10))
    }

    return () => {
      clearTimeout(timer1.current as Timer);
      clearTimeout(timer2.current as Timer);
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      setMessage('...');
    }
  }, [isLoading, setMessage]);

  return (
    isSectionVisible ? (
      <section className="section section--profile">  
        <div className='section__field'>
          <div className='section__field-container'>
            <NavLink
              to={logedUser ? `/profile/${logedUser.id}` : '/error'}
              className={classNames(
                'section__button',
                'section__button--back',
                { 'section__button--enabled': isSectionVisible},
                { 'section__button--disabled': isLoading},
              )}
              onClick={(event) => {
                if (isLoading) {
                  event.preventDefault();
                }
              }}
            >
              {'<-'}
            </NavLink>

            <span className='section__title section__title--with-button'>CHANGE PASSWORD</span>
          </div>

          <p className='section__text'>
          {text}
          </p>

          {!isVerified && (
            <input
              className={classNames(
                'section__input',
                { 'section__input--enabled': isNameVisible},
                { 'section__input--disabled': isLoading},
              )}
              type="password"
              placeholder='Enter old password'
              value={oldPassword}
              disabled={isLoading}
              onChange={(event) => {
                if (oldPassword.length <= 20 && event.target.value.length <= 20) {
                  setOldPassword(event.target.value);
                  setMessage('');
                }  
              }}
            />
          )}

          {isVerified && (
            <>
              <input
                className={classNames(
                  'section__input',
                  { 'section__input--enabled': isNameVisible},
                  { 'section__input--disabled': isLoading},
                )}
                type="password"
                placeholder='Enter new password'
                value={newPassword}
                disabled={isLoading}
                onChange={(event) => {
                  if (newPassword.length <= 20 && event.target.value.length <= 20) {
                    setNewPassword(event.target.value);
                    setMessage('');
                  }
                }}
              />

              <input
                className={classNames(
                  'section__input',
                  { 'section__input--enabled': isNameVisible},
                  { 'section__input--disabled': isLoading},
                )}
                type="password"
                placeholder='Repeat new password'
                value={repeatedPassword}
                disabled={isLoading}
                onChange={(event) => {
                  if (repeatedPassword.length <= 20 && event.target.value.length <= 20) {
                    setRepeatedPassword(event.target.value);
                    setMessage('');
                  }
                }}
              />
            </>
          )}
        </div>

        <div className="section__container">
          {!isVerified && (
            <button
              className={classNames(
                'section__button',
                { 'section__button--enabled': isButtonVisible},
                { 'section__button--disabled': isLoading},
              )}
              disabled={isLoading}
              onClick={onVerify}
            >
              Verify
            </button>
          )}

          {isVerified && (
            <button
              className={classNames(
                'section__button',
                { 'section__button--enabled': isButtonVisible},
                { 'section__button--disabled': isLoading},
              )}
              disabled={isLoading}
              onClick={onReset}
            >
              Reset
            </button>
          )}

          <div
            className={classNames(
                'section__error',
                { 'section__error--enabled': message || isLoading}
            )}
            >
            {`>${message}<`}
            </div>
        </div>
      </section>
    ) : (
      <></>
    )
  )
};
