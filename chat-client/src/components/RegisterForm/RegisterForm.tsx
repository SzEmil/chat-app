import { FormEvent } from 'react';
import css from './RegisterForm.module.css';
import { AppDispatch } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { register } from '../../redux/user/userOperations';


type credentialsRegisterType = {
  username: string;
  email: string;
  password: string;
};
export const RegisterForm = () => {

  const dispatch: AppDispatch = useDispatch();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    const credentials: credentialsRegisterType = {
      username: (form.elements.namedItem('username') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
    };

    await dispatch(register(credentials));

    form.reset();
  };
  return (
    <div className={css.formWrapper}>
      <form className={css.registrationForm} onSubmit={handleSubmit}>
        <h2>Register Now!</h2>

        <div className={css.inputGroup}>
          <label className={css.label} htmlFor="username">
            Username
          </label>
          <input
            className={css.input}
            type="text"
            id="username"
            name="username"
            required
          />
        </div>
        <div className={css.inputGroup}>
          <label className={css.label} htmlFor="email">
            Email
          </label>
          <input
            className={css.input}
            type="email"
            id="email"
            name="email"
            required
            autoComplete='auto'
          />
        </div>
        <div className={css.inputGroup}>
          <label className={css.label} htmlFor="password">
            Password
          </label>
          <input
            className={css.input}
            type="password"
            id="password"
            name="password"
            required
            autoComplete='auto'
          />
        </div>
        <button className={css.button} type="submit">
          Sign up
        </button>
      </form>
    </div>
  );
};
