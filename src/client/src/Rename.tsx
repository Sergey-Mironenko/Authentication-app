import { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useLoading } from './utils/hooks';
import { useAppSelector } from './app/hooks';
import { rename } from './api/requests';
import { actions as logedUserActions } from './features/logedUser';
import { actions as isRenamedActions } from './features/isRenamed';
import { actions as refreshErrorActions } from './features/refreshError';
import { User } from './types/User';
import { Timer } from './types/Timer';
     
export const Rename = () => {
  const dispatch = useDispatch();
  const { logedUser } = useAppSelector(state => state.logedUser);
  const setLogedUser = useCallback((user: User) => dispatch(logedUserActions.setLogedUser(user)), [dispatch]);
  const setIsRenamed = useCallback((condition: boolean) => dispatch(isRenamedActions.setIsRenamed(condition)), [dispatch]);
  const handleRefreshFail = useCallback(() => dispatch(refreshErrorActions.handleRefreshFail()), [dispatch]);
  const instructions = 'Enter new name into the field.';
  const [text, setText] = useState('E');
  const [name, setName] = useState('');
  const [isNameVisible, setIsNameVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
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
 
  const handleRename = async () => {
    setIsLoading(true);
    
    try {
      if (logedUser) {
        const response = await rename(logedUser.email, name);

        setIsRenamed(true);
        setLogedUser(response);    
        setName('');
        handleMessage('Successfully renamed');
      }
    } catch (e: any) {
      if (e.response && e.response.status) {
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
  
  const onRename = () => {
    if (!name) {
      handleMessage('Please enter name');
    } else {
      handleRename();
    }
  }
  
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
      setIsRenamed(false);
    }
  }, [setIsRenamed]);
  
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
  
            <span className='section__title section__title--with-button'>RENAME</span>
          </div>
  
          <p className='section__text'>
            {text}
          </p>
  
          <input
            className={classNames(
              'section__input',
              { 'section__input--enabled': isNameVisible},
              { 'section__input--disabled': isLoading},
            )}
            type="text"
            placeholder='Enter new name'
            value={name}
            disabled={isLoading}
            onChange={(event) => {
              if (name.length <= 20 && event.target.value.length <= 20) {
                setName(event.target.value);
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
              onClick={onRename}
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
        </section>
      ) : (
        <></>
      )
    )
  };
    