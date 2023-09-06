import serviceUser from '../service/serviceUser.js';
import joi from 'joi';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import dotenv from 'dotenv';
import User from '../service/models/User.js';

dotenv.config();

const secret = process.env.TOKEN_SECRET;

export const userSchema = joi.object({
  username: joi.string().required(),
  email: joi.string().email().required(),
  password: joi
    .string()
    .required()
    .pattern(
      new RegExp('^[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};:\'",.<>/?]{3,30}$')
    ),
});

export const userSchemaLogin = joi.object({
  email: joi.string().email().required(),
  password: joi
    .string()
    .required()
    .pattern(
      new RegExp('^[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};:\'",.<>/?]{3,30}$')
    ),
});

export const authUser = async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (error, user) => {
    if (!user || error) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        ResponseBody: {
          message: 'Unauthorized',
        },
      });
    }

    const currentTimestamp = Date.now() / 1000;
    if (user.exp < currentTimestamp) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        ResponseBody: {
          message: 'Unauthorized: Token has expired',
        },
      });
    }

    try {
      const foundUser = await serviceUser.findUserByEmail(user.email);

      if (foundUser.token !== user.token) {
        return res.status(401).json({
          status: 'error',
          code: 401,
          ResponseBody: {
            message: 'Unauthorized: Invalid token',
          },
        });
      }
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

const getUsers = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await serviceUser.findUserById(id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        ResponseBody: {
          message: 'Unauthorized',
        },
      });
    }
    const results = await serviceUser.getUsers();

    res.status(200).json({
      status: 'success',
      code: 200,
      ResponseBody: {
        users: results,
      },
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  if (!req.body)
    return res.status(400).json({
      status: 'error',
      ResponseBody: {
        message: 'Missing fields',
      },
      code: 400,
    });
  try {
    const value = await userSchema.validateAsync(req.body);
    const { username, email, password } = value;

    const user = await serviceUser.findUserByEmail(email);

    if (user) {
      return res.status(409).json({
        status: 'Conflict',
        code: 409,
        ResponseBody: {
          message: 'Email in use',
        },
      });
    }
    try {
      const newUserId = await User.createUser(username, email, password);

      const payload = {
        id: newUserId,
      };

      const token = jwt.sign(payload, secret, { expiresIn: '12h' });

      await serviceUser.updateUserToken(newUserId, token);
      const newUserData = await serviceUser.findUserById(newUserId);

      return res.status(201).json({
        status: 'Created',
        code: 201,
        ResponseBody: {
          message: 'User created',
          user: {
            username: newUserData.username,
            email: newUserData.email,
            token: newUserData.token,
            id: newUserData.id,
          },
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  } catch (error) {
    return res.status(400).json({
      status: 'Bad Request',
      code: 400,
      ResponseBody: {
        message: error.message,
      },
    });
  }
};

const login = async (req, res, next) => {
  if (!req.body)
    return res.status(400).json({
      status: 'error',
      ResponseBody: {
        message: 'Missing fields',
      },
      code: 400,
    });
  try {
    const value = await userSchemaLogin.validateAsync(req.body);
    const { email, password } = value;
    const user = await serviceUser.findUserByEmail(email);

    if (!user || !User.validatePassword(user, password)) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        ResponseBody: {
          message: 'Invalid login or password',
        },
      });
    }

    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '12h' });

    await serviceUser.updateUserToken(user.id, token);
    const newUserData = await serviceUser.findUserById(user.id);

    return res.status(200).json({
      status: 'success',
      code: 200,
      ResponseBody: {
        message: 'User logged in successfully',
        token,
        user: {
          id: newUserData.id,
          username: newUserData.username,
          email: newUserData.email,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad Request',
      code: 400,
      ResponseBody: {
        message: error.message,
      },
    });
  }
};

const logout = async (req, res, next) => {
  const { id } = req.user;
  try {
    const user = await serviceUser.findUserById(id);
    const token = '';
    await serviceUser.updateUserToken(user.id, token);

    return res.status(204).json({
      status: 'success',
      code: 204,
      ResponseBody: {
        message: 'Logout successful',
      },
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      code: 401,
      ResponseBody: {
        message: 'Unauthorized',
      },
    });
  }
};

const currentUser = async (req, res, next) => {
  const { id } = req.user;
  try {
    const user = await serviceUser.findUserById(id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        ResponseBody: {
          message: 'Unauthorized',
        },
      });
    }

    return res.status(200).json({
      status: 'OK',
      code: 200,
      ResponseBody: {
        username: user.username,
        email: user.email,
        id: user.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

const userController = {
  register,
  login,
   logout,
   currentUser,
  getUsers,
};
export default userController;
