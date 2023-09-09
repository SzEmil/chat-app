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

  return (
    <>
      <div className={css.home}>
        {!isLoggedIn ? (
          <div className={css.homeWrapper}>
            <aside className={css.aside}>
              <h1 className={css.title}>Welcome To Chat</h1>
              <p>
                Join our chat community for free! Register now and become a part
                of our vibrant network. Connect with users from around the
                world, exchange messages, and make new friends. Dive into the
                world of instant communication and stay connected like never
                before. Sign up today and start chatting!
              </p>
              <div className={css.joinWrapper}>
                <p className={css.joinText}>Join community now!</p>{' '}
                <button onClick={() => handleOpenLoginForm()}>Join Now</button>
              </div>
            </aside>
            <div>
              {isRegisterFormOpen && !isLoginFormOpen && (
                <div className={css.formBox}>
                  <RegisterForm />
                  <div className={css.changeFormBox}>
                    <p>Already have an account?</p>
                    <button onClick={() => handleOpenLoginForm()}>
                      Sign In
                    </button>
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
            <p>You are logged in</p>
          </div>
        )}
      </div>
    </>
  );
};
