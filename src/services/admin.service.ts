import { NextFunction, Request, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';
import { SignOptions } from 'jsonwebtoken';

// import Token from '@src/models/Token.model';
import User from '../models/User.model';
// import Order from '@src/models/Order.model';
// import Post from '@src/models/Post.model';
// import Product from '@src/models/Product.model';
import { authorizationRoles } from '../constants';
import { cloudinary } from '../middlewares';
import { environmentConfig } from '../configs';

import {
  AuthenticatedRequestBody,
  IUser,
  IPost,
  ProcessingOrderT,
  ProductT,
  ResponseT,
  TPaginationResponse,
  UpdateCommentT,
} from '../interfaces';
import { customResponse, deleteFile, isValidMongooseObjectId, sendEmailVerificationEmail } from '../utils';
import Token from '../models/Token.model';
import Product from '../models/Product.model';





export const adminGetUsersService = async (_req: Request, res: TPaginationResponse) => {
  if (res?.paginatedResults) {
    const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;
    const responseObject: any = {
      totalDocs: totalDocs || 0,
      totalPages: totalPages || 0,
      lastPage: lastPage || 0,
      count: results?.length || 0,
      currentPage: currentPage || 0,
    };
    
    if (next) {
      responseObject.nextPage = next;
    }
    if (previous) {
      responseObject.prevPage = previous;
    }
  responseObject.request = {
    type: 'Get',
    description: 'Get user info',

    // url: `http://localhost:${environmentConfig.PORT}/api/v1/admin/users/${userDoc._doc._id}`,
  },

    responseObject.users = results?.map((userDoc: any) => {
      return {
        ...userDoc._doc,
        
      };
    });

    return res.status(200).send(
      customResponse<typeof responseObject>({
        success: true,
        error: false,
        message: 'Successful Found users',
        status: 200,
        data: responseObject,
      })
    );
  }
};

export const adminGetUserService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  if (!isValidMongooseObjectId(req.params.userId) || !req.params.userId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).send(
        customResponse<typeof data>({
          success: true,
          error: false,
          message: `Successfully not found user by ID: ${req.params.userId} profile 🍀`,
          status: 404,
          data :user,
        })
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, confirmPassword, ...otherUserInfo } = user._doc;

    const data = {
      user: {
        ...otherUserInfo,
        request: {
          type: 'Get',
          description: 'Get all the user',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/admin/users`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found user by ID: ${req.params.userId} profile 🍀`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};
export const adminAddUserService = async (req: Request, res: Response<ResponseT<null>>, next: NextFunction) => {
  const {
    username,
    password,
    confirmPassword,
    role,
  } = req.body;

  try {
    const isUsernameExit = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });

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
      password,
      confirmPassword,
      role,
      acceptTerms: true,
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


    // send mail for email verification

    const data = {
      user: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      },
    };

    return res.status(200).json(
      customResponse<any>({
        data,
        success: true,
        error: false,
        message: `Auth Signup is success. An Email with Verification link has been sent to your account ${user.username} Please Verify Your username first or use the email verification lik which is been send with the response body to verfiy your email`,
        status: 201,
      })
    );
  } catch (error) {
    // Remove file from local uploads folder
    return res.status(500).json(
      customResponse<any>({
        data:error,
        success: false,
        error: true,
        message: ``,
        status: 500,
      })
    );
    return next(InternalServerError);
  }
};
export const adminUpdateAuthService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  const {
    username,
  password,
    role,
  } = req.body;

  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
       return res.status(200).json(
      customResponse<any>({
        success: true,
        error: false,
        message: `Successfully update product by ID ${req.params.productId}`,
        status: 
        404,
        data:{},
      })
    );
    }

    // Admin cant update them roles
    if (req.body.role && req.user?._id.equals(user._id) && req.body.role !== authorizationRoles.superadmin) {
      return next(
        createHttpError(403, `Auth Failed (Admin cant remove themselves from admin , please ask another admin)`)
      );
    }



    user.username = username,
    user.password = password
    user.role =role

    const updatedUser = await user.save({ validateBeforeSave: false, new: true });

    if (!updatedUser) {
      return next(createHttpError(422, `Failed to update user by given ID ${req.params.userId}`));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      password: pass,
      confirmPassword,
      isDeleted,
      status,
      acceptTerms: acceptTerm,
      role: roles,
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



export const adminAddProductService = async (
  req: AuthenticatedRequestBody<ProductT>,
  res: Response,
  next: NextFunction
) => {
  const { name, price, description, brand, category, stock } = req.body;

  // console.log(req.file, req.files);

  const imageUrlList: any[] = [];

  const userId = req?.user?._id || '';

  try {


    const productData = new Product
    ({
      name,
      price,
      description,
      brand,
      category,
      stock,
      productImages: imageUrlList,
      user: userId,
    });

    const createdProduct = await Product.create(productData);

    const data = {
      product: {
        _id: createdProduct._id,
        name: createdProduct.name,
        price: createdProduct.price,
        description: createdProduct.description,
        productImage: createdProduct.productImage,
        productImages: createdProduct.productImages,
        count: createdProduct.count,
        ratings: createdProduct.ratings,
        brand: createdProduct.brand,
        stock: createdProduct.stock,
        category: createdProduct.category,
        reviews: createdProduct.reviews,
        numberOfReviews: createdProduct.numberOfReviews,
        user: {
        
          username: req.user?.username,
 
          createdAt: req.user?.createdAt,
          updatedAt: req.user?.updatedAt,
          role: req.user?.role,
        },
        request: {
          type: 'Get',
          description: 'Get  all products',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/products`,
        },
      },
    };

    return res.status(201).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: 'Successfully created new product',
        status: 201,
        data,
      })
    );
  } catch (error: any) {
   
    // return next(InternalServerError);
    return next(error);
  }
};
export const adminUpdateProductService = async (
  req: AuthenticatedRequestBody<ProductT>,
  res: Response,
  next: NextFunction
) => {
  const { name, price, description, brand, category, stock } = req.body;

  try {
    const product = await Product.findById(req.params.productId);
    console.log(product);
    
    if (!product) {
       return res.status(404).json(
      customResponse<any>({
        success: true,
        error: false,
        message: `Successfully update product by ID ${req.params.productId}`,
        status: 
        404,
        data:{},
      })
    );
    }

    const imageUrlList: any[] = [];


    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    const updatedProduct = await product.save();

    const data = {
      product: {
        ...updatedProduct._doc,
        user: {
          username: req.user?.username,
     
          createdAt: req.user?.createdAt,
          updatedAt: req.user?.updatedAt,
          role: req.user?.role,
        },
        request: {
          type: 'Get',
          description: 'Get  all products',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/products`,
        },
      },
    };

    return res.status(200).json(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully update product by ID ${req.params.productId}`,
        status: 200,
        data,
      })
    );
  } catch (error: any) {
  
    return res.status(500).json(
      customResponse<any>({
        success: false,
        error: true,
        message: `Successfully update product by ID ${req.params.productId}`,
        status: 500,
        data:error,
      })
    );  }
};




