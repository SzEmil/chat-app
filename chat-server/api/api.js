import express from 'express';
import userController from '../controllers/controllerUser.js';
import { authUser } from '../controllers/controllerUser.js';

const router = express.Router();

//users

router.get('/users', authUser, userController.getUsers);

router.post('/users/signUp', userController.register);

router.post('/users/signIn', userController.login);

router.post('/users/signOut', authUser, userController.logout);

router.post('/users/current', authUser, userController.currentUser);

export default router;
