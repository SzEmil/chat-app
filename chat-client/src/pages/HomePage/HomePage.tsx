import { RegisterForm } from '../../components/RegisterForm/RegisterForm';
import { LoginForm } from '../../components/LoginForm/LoginForm';
import { useState } from 'react';
import css from './HomePage.module.css';
import { useSelector } from 'react-redux';
import { selectAuthUserIsLoggedIn } from '../../redux/user/userSelectors';
import { useNavigate } from 'react-router-dom';

export let socket: any;
export const HomePage = () => {
  const isLoggedIn = useSelector(selectAuthUserIsLoggedIn);
  const navigate = useNavigate();

  const [isRegisterFormOpen, setIsRegisterFormOpen] = useState(true);
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);

  const handleOpenRegisterForm = () => {
    setIsLoginFormOpen(false);
    setIsRegisterFormOpen(true);
  };

  const handleOpenLoginForm = () => {
    setIsRegisterFormOpen(false);
    setIsLoginFormOpen(true);
  };

  const handleEnterChat = () => {
    navigate('/chat');
  };
  return (
    <>
      {!isLoggedIn ? (
        <div className={css.homeWrapper}>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
            mollitia dolor rem laudantium, voluptatum amet? Placeat veniam fuga
            perspiciatis amet nulla consequatur, ut laborum asperiores, vel
            blanditiis in sunt exercitationem?
          </p>
          <div>
            {isRegisterFormOpen && !isLoginFormOpen && (
              <div className={css.formBox}>
                <RegisterForm />
                <div className={css.changeFormBox}>
                  <p>Already have an account?</p>
                  <button onClick={() => handleOpenLoginForm()}>Sign In</button>
                </div>
              </div>
            )}

            {!isRegisterFormOpen && isLoginFormOpen && (
              <div className={css.formBox}>
                <LoginForm />
                <div className={css.changeFormBox}>
                  <p>Still no account?</p>
                  <button onClick={() => handleOpenRegisterForm()}>
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => handleEnterChat()}>Enter Chat</button>
        </div>
      )}
    </>
  );
};
