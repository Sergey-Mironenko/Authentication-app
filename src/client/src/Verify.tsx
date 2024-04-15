import { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useLoading } from './utils/hooks';
import { verifyUser, compareTokens } from './api/requests';
import { actions as resetingUserActions } from './features/resetingUser';
import { User } from './types/User';
import { Timer } from './types/Timer';
  
export const Verify = () => {
  const dispatch = useDispatch();
  const setResetingUser = useCallback((user: User) => dispatch(resetingUserActions.setResetingUser(user)), [dispatch]);
  const instructions = 'To change your password enter your email adress and follow instructions from email.';
  const [text, setText] = useState('T');
  const [email, setEmail] = useState('');
  const [verifyToken, setVerifyToken] = useState('')
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSectionVisible, setisSectionVisible] = useState(false);
  const navigate = useNavigate();
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
        const response = await verifyUser(email);
  
        setCurrentUser(response);
        handleMessage('Email was sent');
      } catch (e: any) {
        if (e.response) {
          handleMessage(e.response.data.message);
        } else {
          handleMessage(e.message);
        }
      } finally {
        setIsLoading(false);
        clearInterval(interval.current as Timer);
        clearTimeout(timer2.current as Timer);
      }
    };
  
    const handleCompare = async () => {
      setIsLoading(true);
  
      try {
        if (currentUser) {
          await compareTokens(currentUser.email, verifyToken);
  
          setResetingUser(currentUser);
          navigate(`/reset/${currentUser.id}`);
        }
      } catch (e: any) {
        if (e.response) {
          handleMessage(e.response.data.message);
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
      if (!email) {
        handleMessage('Please enter email');
      } else {
        handleVerify();
      }
    };
  
    const onCompare = () => {
      if (!verifyToken) {
        handleMessage('Please enter token');
      } else {
        handleCompare();
      }
    };
  
    useEffect(() => {
      setisSectionVisible(true);
  
      for (let i = 2; i <= instructions.length + 14 ; i++) {
        timer1.current = setTimeout(() => {
          if (i <= instructions.length) {
            setText(instructions.slice(0, i));
          } else if (i === instructions.length + 7) {
            setIsEmailVisible(true);
          } else if (i === instructions.length + 14) {
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
        <section className="section">
          <div className='section__field'>
          <div className='section__field-container'>
              <NavLink
                to="/login"
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
  
              <span className='section__title section__title--with-button'>VERIFY</span>
            </div>
  
            <p className='section__text'>
              {text}
            </p>
  
            <input
              className={classNames(
                'section__input',
                { 'section__input--verify': !currentUser },
                { 'section__input--enabled': isEmailVisible},
                { 'section__input--disabled': isLoading || currentUser !== null},
              )}
              type="email"
              placeholder='Enter e-mail.'
              value={email}
              disabled={isLoading || currentUser !== null}
              onChange={(event) => {
                if (email.length <= 30 && event.target.value.length <= 30) {
                  setEmail(event.target.value);
                  setCurrentUser(null);
                  setMessage('');
                }
              }}
            />
  
            <input
              className={classNames(
                'section__input',
                { 'section__input--enabled': isEmailVisible && currentUser},
                { 'section__input--disabled': isLoading},
              )}
              type="text"
              placeholder='Enter token from email.'
              value={verifyToken}
              disabled={isLoading}
              onChange={(event) => {
                setVerifyToken(event.target.value);
                setMessage('');
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
              onClick={onVerify}
            >
              {currentUser ? "Send again" : "Send"}
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
  
          {currentUser && (
            <button
              className={classNames(
                'section__button',
                'section__button--reset',
                { 'section__button--enabled': isButtonVisible},
                { 'section__button--disabled': isLoading},
              )}
              disabled={isLoading}
              onClick={onCompare}
            >
              Verify
            </button>
          )}
  
        </section>
      ) : (
        <></>
      )
    )
  };
  