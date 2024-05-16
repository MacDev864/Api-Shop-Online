import { NextFunction, Request, RequestHandler, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';
import { SignOptions } from 'jsonwebtoken';

import Token from '../models/Token.model';
import User from '../models/User.model';
import { environmentConfig } from '../configs/custom-environment-variables.config';

import {
  customResponse,
  deleteFile,
  sendConfirmResetPasswordEmail,
  sendEmailVerificationEmail,
  sendResetPasswordEmail,
} from '../utils';
import { AuthenticatedRequestBody, IUser, ResponseT } from '../interfaces';
import { cloudinary, verifyRefreshToken } from '../middlewares';
import { authorizationRoles } from '../constants';
/*
export const mockSignupService = async (req: Request, res: Response<ResponseT<null>>, next: NextFunction) => {
  
  const arr_mock = [{
    "username":"MacDev648",
    "password":"Mm123456789",
    "confirmPassword" :"Mm123456789"
},{
  "username":"MacDev648",
  "password":"Mm123456789",
  "confirmPassword" :"Mm123456789"
},{
  "username":"MacDev648",
  "password":"Mm123456789",
  "confirmPassword" :"Mm123456789"
},{
  "username":"MacDev648",
  "password":"Mm123456789",
  "confirmPassword" :"Mm123456789"
}];
 let result: object[] = [];
  arr_mock.forEach(async (value:any,index:number)=>{
     value.username  = value.username + (index +20000)
    value.password = value.password 
     value.confirmPassword = value.confirmPassword
     let role = authorizationRoles.user;
     const isUsernameExit = await User.findOne({ username: value.username});
     if (isUsernameExit) {
      return res.status(409).json(
     customResponse<any>({
       data:{},
       success: false,
       error: true,
       message: `Username address ${value.username} is already exists, please pick a different one.`,
       status: 409,
     }))
   }
   let {username,password,confirmPassword} =value;
   const newUser = new User({
    username,
    password,
    confirmPassword,
    role,
   
  });

  const user = await newUser.save();
  let token = await new Token({ userId: user._id });
  const payload = {
    userId: user._id,
  };

  const accessTokenSecretKey = environmentConfig.ACCESS_TOKEN_SECRET_KEY as string;
  const accessTokenOptions: SignOptions = {
    expiresIn: environmentConfig.ACCESS_TOKEN_KEY_EXPIRE_TIME,
    issuer: environmentConfig.JWT_ISSUER,
    audience: String(user._id),
  };

  const refreshTokenSecretKey = environmentConfig.REFRESH_TOKEN_SECRET_KEY as string;
  const refreshTokenJwtOptions: SignOptions = {
    expiresIn: environmentConfig.REFRESH_TOKEN_KEY_EXPIRE_TIME,
    issuer: environmentConfig.JWT_ISSUER,
    audience: String(user._id),
  };

  // Generate and set verify email token
  const generatedAccessToken = await token.generateToken(payload, accessTokenSecretKey, accessTokenOptions);
  const generatedRefreshToken = await token.generateToken(payload, refreshTokenSecretKey, refreshTokenJwtOptions);

  
  // Save the updated token
  token.refreshToken = generatedRefreshToken;
  token.accessToken = generatedAccessToken;
  token = await token.save();



  const data = {
    user: {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    },
  };
    result.push(value);
 
  })
  try {
    return res.status(201).json(
      customResponse<any>({
        data:result,
        success: true,
        error: false,
        message: ``,
        status: 201,
      })
    );
  } catch (error) {
    return res.status(500).json(
      customResponse<any>({
        data:error,
        success: false,
        error: true,
        message: ``,
        status: 500,
      })
    );
  }

 
};
*/
export const signupService = async (req: Request, res: Response<ResponseT<null>>, next: NextFunction) => {
  const {
    username,
    password,
    name,
    surname,
    gender,
    email,
    tel,
    confirmPassword,
    address
  } = req.body;


  let role = authorizationRoles.superadmin;
  try {
    const isUsernameExit = await User.findOne({ username: username});
    if (isUsernameExit) {
       return res.status(409).json(
      customResponse<any>({
        data:{},
        success: false,
        error: true,
        message: `Username address ${username} is already exists, please pick a different one.`,
        status: 409,
      }))
    }

  

    const newUser = new User({
      username,
      name,
      tel,
      surname,
      gender,
      email,
      address,
      password,
      confirmPassword,
      role,
     
    });

    const user = await newUser.save();
    let token = await new Token({ userId: user._id });

    const payload = {
      userId: user._id,
    };

    const accessTokenSecretKey = environmentConfig.ACCESS_TOKEN_SECRET_KEY as string;
    const accessTokenOptions: SignOptions = {
      expiresIn: environmentConfig.ACCESS_TOKEN_KEY_EXPIRE_TIME,
      issuer: environmentConfig.JWT_ISSUER,
      audience: String(user._id),
    };

    const refreshTokenSecretKey = environmentConfig.REFRESH_TOKEN_SECRET_KEY as string;
    const refreshTokenJwtOptions: SignOptions = {
      expiresIn: environmentConfig.REFRESH_TOKEN_KEY_EXPIRE_TIME,
      issuer: environmentConfig.JWT_ISSUER,
      audience: String(user._id),
    };

    // Generate and set verify email token
    const generatedAccessToken = await token.generateToken(payload, accessTokenSecretKey, accessTokenOptions);
    const generatedRefreshToken = await token.generateToken(payload, refreshTokenSecretKey, refreshTokenJwtOptions);
  
    
    // Save the updated token
    token.refreshToken = generatedRefreshToken;
    token.accessToken = generatedAccessToken;
    token = await token.save();

    const data = {

    user: {
      name: user.name,
      surname: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      tel:user.tel,
      address:user.address,
      gender: user.gender,
      _id: user._id,

  },
     
     token
    };

    return res.status(201).json(
      customResponse<any>({
        data,
        success: true,
        error: false,
        message: `Auth Signup is success. An Email with Verification link has been sent to your account ${user.email} Please Verify Your Email first or use the email verification lik which is been send with the response body to verfiy your email`,
        status: 201,
      })
    );
  } catch (error: any) {
    // Remove file from local uploads folder

    return next(InternalServerError);
  }
};
export const loginService = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') })
      .select('+password')
      .exec();

    // 401 Unauthorized
    if (!user) {
      return next(createHttpError(401, 'Auth Failed (Invalid Credentials)'));
    }

    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return next(createHttpError(401, 'Auth Failed (Invalid Credentials)'));
    }

    let token = await Token.findOne({ userId: user._id });

    if (!token) {
      token = await new Token({ userId: user._id });
      token = await token.save();
    }

    const generatedAccessToken = await token.generateToken(
      {
        userId: user._id,
      },
      environmentConfig.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: environmentConfig.ACCESS_TOKEN_KEY_EXPIRE_TIME,
        issuer: environmentConfig.JWT_ISSUER,
        audience: String(user._id),
      }
    );
    const generatedRefreshToken = await token.generateToken(
      {
        userId: user._id,
      },
      environmentConfig.REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: environmentConfig.REFRESH_TOKEN_KEY_EXPIRE_TIME,
        issuer: environmentConfig.JWT_ISSUER,
        audience: String(user._id),
      }
    );

    // Save the updated token
    token.refreshToken = generatedRefreshToken;
    token.accessToken = generatedAccessToken;
    token = await token.save();

    // check user is verified or not
    if ( user.status !== 'active') {

      // Again send verification email

      const responseData = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };

      return res.status(401).json(
        customResponse<typeof responseData>({
          data: responseData,
          success: false,
          error: true,
          message: `Your Email has not been verified. An Email with Verification link has been sent to your account ${user.email} Please Verify Your Email first or use the email verification lik which is been send with the response to verfiy your email`,
          status: 401,
        })
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, confirmPassword, isVerified, isDeleted, status, acceptTerms, ...otherUserInfo } = user._doc;

    const data = {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      user: otherUserInfo,
    };

    // Set cookies
    res.cookie('accessToken', token.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // one days
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
    });

    // Set refreshToken' AND accessToken IN cookies
    return res.status(200).json(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: 'Auth logged in successful.',
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};


export const getAuthProfileService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {

    const user = await User.findById(req.user?._id)
      .select('-username -confirmPassword  -status -isDeleted ')
      .populate('cart.items.productId')
      .exec();

    if (!user) {
      return next(createHttpError(401, `Auth Failed `));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      password: pass,
      confirmPassword,
      isVerified,
      isDeleted,
      status,
      acceptTerms,
      role,
      ...otherUserInfo
    } = user._doc;

    return res.status(200).send(
      customResponse<{ user: IUser }>({
        success: true,
        error: false,
        message: 'Successfully found user profile 🍀',
        status: 200,
        data: { user: otherUserInfo },
      })
    );
  } catch (error) {
    return res.status(500).send(
      customResponse<object>({
        success: false,
        error: true,
        message: '',
        status: 500,
        data: {},
      })
    );
    // return next(InternalServerError);
  }
};

export const logoutService: RequestHandler = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    const token = await Token.findOne({
      refreshToken,
    });

    if (!token) {
 return res.status(404).send(
      customResponse<any>({
        success: false,
        error: true,
        message: `Successfully updated user by ID: ${req.params.userId}`,
        status: 404,
        data: { user:{} },
      })
    );    }

    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
 return res.status(404).send(
      customResponse<any>({
        success: false,
        error: true,
        message: `Successfully updated user by ID: ${req.params.userId}`,
        status: 404,
        data: { user:{} },
      })
    );    }

    // Clear Token
    await Token.deleteOne({
      refreshToken,
    });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: 'Successfully logged out 😏 🍀',
        status: 200,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const updateAuthService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  const {
    username,
    name,
    surname,
    gender,
    email,
    tel,
    address,
 
  } = req.body;

  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
 return res.status(404).send(
      customResponse<any>({
        success: false,
        error: true,
        message: `Successfully updated user by ID: ${req.params.userId}`,
        status: 404,
        data: { user:{} },
      })
    );    }

    if (!req.user?._id.equals(user._id)) {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    
    user.username = username || user.username;
    user.name = name || user.name;
    user.surname = surname || user.surname;
    user.gender = gender || user.gender;
    user.email = email || user.email;
    user.tel = tel || user.tel;
    user.address = address || user.address;
    
  


    const updatedUser = await user.save({ validateBeforeSave: false, new: true });

    if (!updatedUser) {
      return next(createHttpError(422, `Failed to update user by given ID ${req.params.userId}`));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      password: pass,
      confirmPassword,
      isVerified,
      isDeleted,
      status,
      acceptTerms: acceptTerm,
      role,
      ...otherUserInfo
    } = updatedUser._doc;

    return res.status(200).send(
      customResponse<{ user: IUser }>({
        success: true,
        error: false,
        message: `Successfully updated user by ID: ${req.params.userId}`,
        status: 200,
        data: { user: otherUserInfo },
      })
    );
  } catch (error) {
    // Remove file from local uploads folder
    if (req.file?.filename) {
      const localFilePath = `${process.env.PWD}/public/uploads/users/${req.file?.filename}`;
      deleteFile(localFilePath);
    }
    return next(InternalServerError);
  }
};

export const removeAuthService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
 return res.status(404).send(
      customResponse<any>({
        success: false,
        error: true,
        message: `Successfully updated user by ID: ${req.params.userId}`,
        status: 404,
        data: { user:{} },
      })
    );    }

    if (!req.user?._id.equals(user._id) && req?.user?.role !== 'superadmin') {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }



    // Delete user from db
    const deletedUser = await User.findByIdAndRemove({
      _id: req.params.userId,
    });

    if (!deletedUser) {
      return next(createHttpError(422, `Failed to delete user by given ID ${req.params.userId}`));
    }

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted user by ID ${req.params.userId}`,
        status: 200,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};


export const refreshTokenService: RequestHandler = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    let token = await Token.findOne({
      refreshToken,
    });

    if (!token) {
 return res.status(404).send(
      customResponse<any>({
        success: false,
        error: true,
        message: `Successfully updated user by ID: ${req.params.userId}`,
        status: 404,
        data: { user:{} },
      })
    );    }

    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
 return res.status(404).send(
      customResponse<any>({
        success: false,
        error: true,
        message: `Successfully updated user by ID: ${req.params.userId}`,
        status: 404,
        data: { user:{} },
      })
    );    }

    const generatedAccessToken = await token.generateToken(
      {
        userId,
      },
      environmentConfig.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: environmentConfig.ACCESS_TOKEN_KEY_EXPIRE_TIME,
        issuer: environmentConfig.JWT_ISSUER,
        audience: String(userId),
      }
    );
    const generatedRefreshToken = await token.generateToken(
      {
        userId,
      },
      environmentConfig.REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: environmentConfig.REFRESH_TOKEN_KEY_EXPIRE_TIME,
        issuer: environmentConfig.JWT_ISSUER,
        audience: String(userId),
      }
    );

    // Save the updated token
    token.refreshToken = generatedRefreshToken;
    token.accessToken = generatedAccessToken;
    token = await token.save();

    // Response data
    const data = {
      user: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      },
    };

    // Set cookies
    res.cookie('accessToken', token.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // one days
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
    });

    // Set refreshToken' AND accessToken IN cookies
    return res.status(200).json(
      customResponse<typeof data>({
        data,
        success: true,
        error: false,
        message: 'Auth logged in successful.',
        status: 200,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const sendForgotPasswordMailService: RequestHandler = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const message = `The email address ${email} is not associated with any account. Double-check your email address and try again.`;
      return next(createHttpError(401, message));
    }

    let token = await Token.findOne({ userId: user._id });

    if (!token) {
      token = await new Token({ userId: user._id });
      token = await token.save();
    }

    const generatedAccessToken = await token.generateToken(
      {
        userId: user._id,
      },
      environmentConfig.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: environmentConfig.ACCESS_TOKEN_KEY_EXPIRE_TIME,
        issuer: environmentConfig.JWT_ISSUER,
        audience: String(user._id),
      }
    );
    const generatedRefreshToken = await token.generateToken(
      {
        userId: user._id,
      },
      environmentConfig.REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: environmentConfig.REST_PASSWORD_LINK_EXPIRE_TIME,
        issuer: environmentConfig.JWT_ISSUER,
        audience: String(user._id),
      }
    );

    // Save the updated token
    token.refreshToken = generatedRefreshToken;
    token.accessToken = generatedAccessToken;
    token = await token.save();

    const passwordResetEmailLink = `${environmentConfig.WEBSITE_URL}/reset-password?id=${user._id}&token=${token.refreshToken}`;

    // password Reset Email
    sendResetPasswordEmail(email, user.name, passwordResetEmailLink);

    const data = {
      user: {
        resetPasswordToken: passwordResetEmailLink,
      },
    };

    return res.status(200).json(
      customResponse<typeof data>({
        data,
        success: true,
        error: false,
        message: `Auth success. An Email with Rest password link has been sent to your account ${email}  please check to rest your password or use the the link which is been send with the response body to rest your password`,
        status: 200,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const resetPasswordService: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return next(createHttpError(401, `Password reset token is invalid or has expired.`));

    const token = await Token.findOne({ userId: req.params.userId, refreshToken: req.params.token });

    if (!token) return next(createHttpError(401, 'Password reset token is invalid or has expired.'));

    const userId = await verifyRefreshToken(req.params.token);

    if (!userId) {
 return res.status(404).send(
      customResponse<any>({
        success: false,
        error: true,
        message: `Successfully updated user by ID: ${req.params.userId}`,
        status: 404,
        data: { user:{} },
      })
    );    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    await token.delete();

    const confirmResetPasswordEmailLink = `${environmentConfig.WEBSITE_URL}/login`;

    sendConfirmResetPasswordEmail(user.email, user.name, confirmResetPasswordEmailLink);

    const data = {
      loginLink: confirmResetPasswordEmailLink,
    };

    return res.status(200).json(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Your password has been Password Reset Successfully updated please login`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};
