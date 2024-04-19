import { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useAppSelector } from './app/hooks';
import { useLoading } from './utils/hooks';
import { resetEmail, verifyEmail, verifyPassword } from './api/requests';
import { actions as logedUserActions } from './features/logedUser';
import { actions as refreshErrorActions } from './features/refreshError';
import { User } from './types/User';
import { Timer } from './types/Timer';
  
export const ChangeEmail = () => {
  const dispatch = useDispatch();
  const { logedUser } = useAppSelector(state => state.logedUser);
  const setLogedUser = useCallback((user: User) => dispatch(logedUserActions.setLogedUser(user)), [dispatch]);
  const handleRefreshFail = useCallback(() => dispatch(refreshErrorActions.handleRefreshFail()), [dispatch]);
  const instructions = 'Enter your password first. Then enter new email and and check your new email box.';
  const [text, setText] = useState('E');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
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
        await verifyPassword(logedUser.email, password);
  
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
  
  const handleSend = async () => {
    setIsLoading(true);
    setResetToken('');
        
    try {
      await verifyEmail(newEmail);
 
      setCurrentEmail(newEmail);
      handleMessage('Email has been sent');
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
  
  const handleReset = async () => {
    setIsLoading(true);
  
    try {
      if (logedUser) {
        const { user, accessToken } = await resetEmail(logedUser.email, currentEmail, resetToken);

        localStorage.setItem('accessToken', accessToken);
  
        setLogedUser(user);
        setCurrentEmail('');
        setNewEmail('');
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
  
  const onVerify = () => {
    if (!password) {
      handleMessage('Please enter old password');
    } else {
      handleVerify();
    }
  };
  
  const onSend = () => {
    if (!newEmail) {
      handleMessage('Please enter new email');
    } else {
      handleSend();
    }
  };
  
  const onReset = () => {
    if (!resetToken) {
      handleMessage('Please enter token');
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
          setIsInputVisible(true);
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
    
            <span className='section__title section__title--with-button'>CHANGE EMAIL</span>
          </div>
    
          <p className='section__text'>
            {text}
          </p>
    
          {!isVerified && (
            <input
              className={classNames(
                'section__input',
                { 'section__input--enabled': isInputVisible},
                { 'section__input--disabled': isLoading},
              )}
              type="password"
              placeholder='Enter password'
              value={password}
              disabled={isLoading}
              onChange={(event) => {
                if (password.length <= 20 && event.target.value.length <= 20) {
                  setPassword(event.target.value);
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
                  { 'section__input--enabled': isInputVisible},
                  { 'section__input--disabled': isLoading || currentEmail !== ''},
                )}
                type="email"
                placeholder='Enter new email'
                value={newEmail}
                disabled={isLoading || currentEmail !== ''}
                onChange={(event) => {
                  if (newEmail.length <= 30 && event.target.value.length <= 30) {
                    setNewEmail(event.target.value);
                    setMessage('');
                  }
                }}
              />
  
              {currentEmail && (
                <input
                  className={classNames(
                    'section__input',
                    { 'section__input--enabled': isInputVisible},
                    { 'section__input--disabled': isLoading},
                  )}
                  type="text"
                  placeholder='Enter token fron email'
                  value={resetToken}
                  disabled={isLoading}
                  onChange={(event) => {
                    setResetToken(event.target.value);
                    setMessage('');
                  }}
                />
              )}      
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
                'section__button--reset',
                { 'section__button--enabled': isButtonVisible},
                { 'section__button--disabled': isLoading},
              )}
              disabled={isLoading}
              onClick={onSend}
            >
              {currentEmail ? 'Send again' : 'Send'}
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
  
        {currentEmail && (
          <button
            className={classNames(
              'section__button',
              'section__button--reset',
              { 'section__button--enabled': isButtonVisible},
              { 'section__button--disabled': isLoading},
            )}
            disabled={isLoading}
            onClick={onReset}
          >
            Reset
          </button>
        )}
      </section>
    ) : (
      <></>
    )
  )
};
  