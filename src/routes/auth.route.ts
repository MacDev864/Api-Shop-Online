import express from 'express';

import {
  isAuth,
  loginUserValidation,
  refreshTokenValidation,
  resetPasswordValidation,
  signupUserValidation,
  updateUserValidation,
  uploadImage,
  userIdValidation,
} from '../middlewares';
import {
  getAuthProfileController,
  loginController,
  logoutController,
  updateAuthController,
  refreshTokenController,
  removeAuthController,
  resetPasswordController,
  signupController,
} from '../controllers/auth.controller';

const router = express.Router();

router.post('/signup', signupUserValidation, signupController);
router.post('/login', loginUserValidation, loginController);
router.post('/logout', refreshTokenValidation, logoutController);
router.patch('/update/:userId', isAuth, updateUserValidation, updateAuthController);
router.delete('/remove/:userId', isAuth, userIdValidation, removeAuthController);
router.post('/refresh-token', refreshTokenValidation, refreshTokenController);
router.post('/reset-password/:userId/:token', resetPasswordValidation, resetPasswordController);
router.get('/me', isAuth, getAuthProfileController);

export default router;
