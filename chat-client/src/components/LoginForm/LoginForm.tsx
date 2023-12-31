import css from './LoginForm.module.css';
import { AppDispatch } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { logIn } from '../../redux/user/userOperations';
import { FormEvent } from 'react';



type credentialsLoginType = {
  email: string;
  password: string;
};

export const LoginForm = () => {

  const dispatch: AppDispatch = useDispatch();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    const credentials: credentialsLoginType = {
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
    };

    await dispatch(logIn(credentials));
    form.reset();
  };
  return (
    <div className={css.formWrapper}>
      <form className={css.loginForm} onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className={css.inputGroup}>
          <label className={css.label} htmlFor="email">Email</label>
          <input className={css.input} type="email" id="email" name="email" required autoComplete='auto'/>
        </div>
        <div className={css.inputGroup}>
          <label className={css.label} htmlFor="password">Password</label>
          <input className={css.input} type="password" id="password" name="password" required autoComplete='auto'/>
        </div>
        <button className={css.button} type="submit">
          Sign In
        </button>
      </form>
    </div>
  );
};
