import { useEffect, useRef, useState } from "react";
import { User } from "./types/User";
import { Timer } from "./types/Timer";

type Props = {
  users: User[];
};

export const Users: React.FC<Props> = ({ users }) => {
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  let timer = useRef<Timer | null>(null);
  
  useEffect(() => {
    clearTimeout(timer.current as Timer);

    for (let i = 1; i <= users.length; i++) {
      timer.current = setTimeout(() => {
        setVisibleUsers(users.slice(0, i));
      }, (i * 70))
    }

    return () => clearTimeout(timer.current as Timer);
  }, [users]);

  return (
    <div className="users">
      <div className="users__content users__content--main">
        <span className="users__text">id</span>
        <span className="users__text">email</span>
      </div>
  
      {visibleUsers.map(person => (
        <div className="users__content" key={person.id}>
          <span className="users__text">{person.id}</span>
          <span className="users__text">{person.email}</span>
        </div>
      ))} 
    </div>
  )
};
