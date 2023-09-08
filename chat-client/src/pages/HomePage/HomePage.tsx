import { RegisterForm } from '../../components/RegisterForm/RegisterForm';
import { LoginForm } from '../../components/LoginForm/LoginForm';
import { useState} from 'react';
import css from './HomePage.module.css';
import { nanoid } from 'nanoid';


export let socket: any;
export const HomePage = () => {
    const [isLoggedin, setIsLoggedIn] = useState(false);
    const [socketReady, setSocketReady] = useState(false);
    const [userName, setUsername] = useState('');
    const [userId, setUserId] = useState('');




  const [isRegisterFormOpen, setIsRegisterFormOpen] = useState(true);
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(true);

  const handleOpenRegisterForm = () => {
    setIsLoginFormOpen(false);
    setIsRegisterFormOpen(true);
  };

  const handleOpenLoginForm = () => {
    setIsRegisterFormOpen(false);
    setIsLoginFormOpen(true);
  };
  return (
    <div className={css.homeWrapper}>
            <div>
      <input
        name="userName"
        type="text"
        placeholder="Enter your username"
        value={userName}
        onChange={e => setUsername(e.target.value)}
      />
      <button
        onClick={() => {
          setIsLoggedIn(true);
          setUserId(nanoid());
        }}
      >
        LOGIN
      </button>
      {isLoggedin && <p>Logged</p>}
      {!isLoggedin && <p>No loged</p>}
      {isLoggedin && socketReady && (
        <Chat
          socket={socket}
          userName={userName}
          isLoggedin={isLoggedin}
          userId={userId}
        />
      )}
    </div>
      HomePage
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi mollitia
        dolor rem laudantium, voluptatum amet? Placeat veniam fuga perspiciatis
        amet nulla consequatur, ut laborum asperiores, vel blanditiis in sunt
        exercitationem?
      </p>
      <div>
        {isRegisterFormOpen && !isLoginFormOpen && <RegisterForm />}
        {!isRegisterFormOpen && isLoginFormOpen && <LoginForm />}
      </div>
    </div>
  );
};
