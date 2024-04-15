import { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, useLocation, NavLink, useNavigate, } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { logoutUser } from './api/requests';
import { useAppSelector } from './app/hooks';
import { actions as logedUserActions } from './features/logedUser';
import { Timer } from './types/Timer';

export const Profile = () => {
  const dispatch = useDispatch();
  const { logedUser } = useAppSelector(state => state.logedUser);
  const { isRenamed } = useAppSelector(state => state.isRenamed);
  const removeLogedUser = useCallback(() => dispatch(logedUserActions.removeLogedUser()), [dispatch]);
  const message = `Welcome\n${logedUser ? logedUser.name : ''}`;
  const [text, setText] = useState('W');
  const [isLogingOut, setIsLogingOut] = useState(false);
  const [visibleButtonsAmount, setVisibleButtonsAmount] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const animationCondition = logedUser ? (pathname === `/profile/${logedUser.id}`) : false;
  let timer = useRef<Timer | null>(null);
  
  const onLogOut = async () => {
    setIsLogingOut(true);
  
    try {
      await logoutUser();   
    } catch {
      navigate('/error');
    } finally {
      localStorage.removeItem('accessToken');
      removeLogedUser();
      setIsLogingOut(false);
    }
  };
  
  useEffect(() => {
    setVisibleButtonsAmount(0);

    if (animationCondition) {
      for (let i = 2; i <= message.length + 5; i++) {
        timer.current = setTimeout(() => {
          setText(message.slice(0, i));
      
          switch (i) {
            case message.length + 1:
              setVisibleButtonsAmount(1);
              break;
            case message.length + 2:
              setVisibleButtonsAmount(2);
              break;
            case message.length + 3:
              setVisibleButtonsAmount(3);
              break;
            case message.length + 4:
              setVisibleButtonsAmount(4);
              break;
            case message.length + 5:
              setVisibleButtonsAmount(5);
              break;
            default:
          } 
        }, (i * 50))
      }
    } else {
      if (isRenamed) {
        for (let i = 9; i <= message.length + 1; i++) {
          timer.current = setTimeout(() => {
            setText(message.slice(0, i));
          }, (i * 50))
        }
      } else {
        setText(message);
      }
        
      setVisibleButtonsAmount(0);
    }
  
    return () => clearTimeout(timer.current as Timer);
  }, [isRenamed, message, animationCondition, setText]);
    
  return (
    <>
      <h4 className="main__title">{text}</h4>
        
      {animationCondition && (
        <div className="main__container main__container--profile">
          <button
            className={classNames(
              'main__button',
              'main__button--profile',
              { 'main__button--enabled': visibleButtonsAmount >= 1 },
              { 'main__button--disabled': isLogingOut},
            )}
            disabled={isLogingOut}
            onClick={onLogOut}
          >
            Log out
          </button>

          <NavLink
            to={logedUser ? `/profile/${logedUser.id}/users` : '/error'}
            className={({ isActive }) => classNames(
              'main__button',
              'main__button--profile',
              { 'main__button--enabled': visibleButtonsAmount >= 2 },
              { 'main__button--focused': isActive},
              { 'main__button--disabled': isLogingOut},
            )} 
            onClick={(event) => {
              if (isLogingOut) {
                event.preventDefault();
              }
            }}
          >
            Users
          </NavLink>

          <NavLink
            to={logedUser ? `/profile/${logedUser.id}/rename` : '/error'}
            className={({ isActive }) => classNames(
              'main__button',
              'main__button--profile',
              { 'main__button--enabled': visibleButtonsAmount >= 3 },
              { 'main__button--focused': isActive},
              { 'main__button--disabled': isLogingOut},
            )}
            onClick={(event) => {
              if (isLogingOut) {
                event.preventDefault();
              }
            }}
          >
            Change name
          </NavLink>

          <NavLink
            to={logedUser ? `/profile/${logedUser.id}/change+email` : '/error'}
            className={({ isActive }) => classNames(
              'main__button',
              'main__button--profile',
              { 'main__button--enabled': visibleButtonsAmount >= 4 },
              { 'main__button--focused': isActive},
              { 'main__button--disabled': isLogingOut},
            )}
            onClick={(event) => {
              if (isLogingOut) {
                event.preventDefault();
              }
            }}
          >
            Change email
          </NavLink>

          <NavLink
            to={logedUser ? `/profile/${logedUser.id}/change+password` : '/error'}
            className={({ isActive }) => classNames(
              'main__button',
              'main__button--profile',
              { 'main__button--enabled': visibleButtonsAmount >= 5 },
              { 'main__button--focused': isActive},
              { 'main__button--disabled': isLogingOut},
            )}
            onClick={(event) => {
              if (isLogingOut) {
                event.preventDefault();
              }
            }}
          >
            Change password
          </NavLink>
        </div>
      )}
  
      <div>
        <Outlet />
      </div>
    </>
  )
};
  