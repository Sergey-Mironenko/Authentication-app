import { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useAppSelector } from './app/hooks';
import { useLoading } from './utils/hooks';
import { getUsers } from './api/requests';
import { actions as refreshErrorActions } from './features/refreshError';
import { Users } from './Users';
import { User } from './types/User';
import { Timer } from './types/Timer';

export const UserList = () => {
  const dispatch = useDispatch();
  const { logedUser } = useAppSelector(state => state.logedUser);
  const handleRefreshFail = useCallback(() => dispatch(refreshErrorActions.handleRefreshFail()), [dispatch]);
  const instructions = 'List of all activated users.';
  const [text, setText] = useState('E');
  const [isListVisible, setIsListVisible] = useState(false);
  const [areButtonsVisible, setAreButtonsVisible] = useState(false);
  const [isReturnVisible, setIsReturnVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionVisible, setisSectionVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const perPage = 5;
  const currentStart = page * perPage;
  const currentEnd = users ? (
    (currentStart + perPage) <= users.length
      ? currentStart + perPage
      : users.length
  ) : 0;
  const pagesAmount = users ? (
    users.length % perPage !== 0
      ? Math.ceil(users.length / perPage)
      : users.length / perPage
  ) : 0;
  let timer1 = useRef<Timer | null>(null);
  let timer2 = useRef<Timer | null>(null);
  let interval = useRef<Timer | null>(null);
  const [message, setMessage] = useLoading(interval, '');

  const loadUsers = useCallback(async () => {
    const handleMessage = (errorMessage: string) => {
      for (let i = 1; i <= errorMessage.length + 1 ; i++) {
        timer2.current = setTimeout(() => {
          setMessage(errorMessage.slice(0, i));
        }, (i * 25))
      }
    };
  
    setIsLoading(true);
    setisSectionVisible(true);
    setIsReturnVisible(true);
      
    try {
      const response = await getUsers();
  
      if (response && response.length === 1) {
        setUsers(response);
        setMessage('');
      } else if (response && response.length > 1) {
        setUsers(response.sort((curr: User, prev: User) => curr.id - prev.id));
        setMessage('');
      } else {
        handleMessage('No activated users');
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
  }, [setMessage, handleRefreshFail]);

  const toStart = () => {
    setPage(0);
  };

  const toEnd = () => {
    if (users.length % perPage === 0) {
        setPage(Math.floor(users.length / perPage) - 1);
      } else {
        setPage(Math.floor(users.length / perPage));
      }
  };

  const toPrevPage = () => {
    setPage(page - 1);
  };

  const toNextPage = () => {
    setPage(page + 1);
  };
  
  useEffect(() => {
    loadUsers();
  
    for (let i = 2; i <= instructions.length + 14 ; i++) {
      timer1.current = setTimeout(() => {
        if (i <= instructions.length) {
          setText(instructions.slice(0, i));
        } else if (i === instructions.length + 7) {
          setIsListVisible(true);
        } else if (i === instructions.length + 14) {
          setAreButtonsVisible(true);
        }
      }, (i * 10))
    }
  
    return () => {
      clearTimeout(timer1.current as Timer);
      clearTimeout(timer2.current as Timer);
    }
  }, [loadUsers]);
  
  useEffect(() => {
    if (isLoading && isListVisible) {
      setMessage('...');
    }
  }, [isLoading, setMessage, isListVisible]);
  
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
                { 'section__button--enabled': isReturnVisible},
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
  
            <span className='section__title section__title--with-button'>USERS</span>
          </div>
  
          <p className='section__text'>
            {text}
          </p>
  
          {isListVisible && (
            <div className="section__list">
              {!isLoading && users && users.length > 0
                ? (
                  <Users users={users.slice(currentStart, currentEnd)}/>
                ) : (
                  <div
                    className={classNames(
                      'section__error',
                      'section__error--list',
                      { 'section__error--enabled': message || isLoading}
                    )}
                  >
                    {`>${message}<`}
                  </div>
              )}
            </div>
          )}
        </div>
  
        <div className="section__container section__container--list">
          <button
            className={classNames(
              'section__button',
              'section__button--list',
              { 'section__button--enabled': areButtonsVisible},
              {'section__button--disabled': isLoading || !users || page === 0}
            )}
            disabled={isLoading || !users || page === 0}
            onClick={toStart}
          >
            {'<<'}
          </button>
  
          <button
            className={classNames(
              'section__button',
              'section__button--list',
              { 'section__button--enabled': areButtonsVisible},
              {'section__button--disabled': isLoading || !users || page === 0}
            )}
            disabled={isLoading || !users || page === 0}
            onClick={toPrevPage}
          >
            {'<'}
          </button>
  
          <div
            className={classNames(
              'section__page_container',
              { 'section__page_container--enabled': areButtonsVisible },
            )}
          >
            {`${users && users.length > 0 ? page + 1 : 0} / ${pagesAmount}`}
          </div>
  
          <button
            className={classNames(
              'section__button',
              'section__button--list',
              { 'section__button--enabled': areButtonsVisible},
              {'section__button--disabled': isLoading || !users || (currentEnd >= users.length)},
            )}
            disabled={isLoading || !users || (currentEnd >= users.length)}
            onClick={toNextPage}
          >
            {'>'}
          </button>
  
          <button
            className={classNames(
              'section__button',
              'section__button--list',
              { 'section__button--enabled': areButtonsVisible},
              {'section__button--disabled': isLoading || !users || (currentEnd >= users.length)}
            )}
            disabled={isLoading || !users || (currentEnd >= users.length)}
            onClick={toEnd}
          >
            {'>>'}
          </button>
        </div>
      </section>
      ) : (
      <></>
    )
  )
};
