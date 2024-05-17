import { NextFunction, Request, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';
import { SignOptions } from 'jsonwebtoken';

// import Token from '@src/models/Token.model';
import User from '../models/User.model';
import Order from '../models/Order.model';

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
    name,
    surname,
    gender,
    email,
    tel,
    confirmPassword,
    address,
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
      address,
      tel,
      name,
      surname,
      gender,
      email,
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
    name,
    surname,
    gender,
    email,
    tel,
    address,
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



    user.username = username
    user.password = password
    user.role =role
     user.name = name
     user.surname =  surname
     user.gender = gender
     user.email = email
     user.tel = tel
     user.address = address

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
        message: `not found product by ID ${req.params.productId}`,
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
export const adminDeleteProductService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return next(new createHttpError.BadRequest());
    }

    const isDeleted = await product.remove();
    if (!isDeleted) {
      return next(createHttpError(400, `Failed to delete product by given ID ${req.params.productId}`));
    }




    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted product by ID ${req.params.productId}`,
        status: 200,
      })
    );

 
  } catch (error) {
    return next(InternalServerError);
  }
};

export const adminClearAllProductsService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find();
    // Delete complete product collection
    const dropCompleteCollection = await Product.deleteMany({});

    if (dropCompleteCollection.deletedCount === 0) {
      return next(createHttpError(400, `Failed to clear posts`));
    }

    // Remove all the images
    products.forEach((product) => {
      product?.productImages?.forEach(async (image: any) => {
        // Delete image from cloudinary
        if (image?.cloudinary_id) {
          await cloudinary.uploader.destroy(image.cloudinary_id);
        }
      });
    });

    return res.status(200).send(
      customResponse({
        success: true,
        error: false,
        message: `Successful cleared all products`,
        status: 200,
        data: null,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};



export const adminGetProductService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.productId) || !req.params.productId) {
    // return next(createHttpError(422, `Invalid request`));
    return res.status(422).send(
      customResponse<object>({
        success: false,
        error: true,
        message: `Invalid request`,
        status: 422,
        data:{},
      })
    );
  }

  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      // return next(new createHttpError.BadRequest());
      return res.status(404).send(
        customResponse<typeof data>({
          success: false,
          error: true,
          message: `not found product by ID: ${req.params.productId}`,
          status: 404,
          data:product,
        })
      );
    }

    const data = {
      product: {
        ...product._doc,
        request: {
          type: 'Get',
          description: 'Get all the product',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/admin/products`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found product by ID: ${req.params.productId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    // return next(InternalServerError);

    return res.status(500).send(
      customResponse<typeof error
      >({
        success: false,
        error: true,
        message: ``,
        status: 500,
        data:error,
      }))
  }
};
export const adminGetProductsService = async (_req: Request, res: TPaginationResponse) => {
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

    responseObject.products = results?.map((productDoc: any) => {
      const { productImage } = productDoc._doc;
      return {
        ...productDoc._doc,
        productImage: `${process.env.API_URL}${productImage}`,
        request: {
          type: 'Get',
          description: 'Get one product with the id',
          
        },
      };
    });

    return res.status(200).send(
      customResponse<typeof responseObject>({
        success: true,
        error: false,
        message: 'Successful Found products',
        status: 200,
        data: responseObject,
      })
    );
  }
};
export const adminGetOrdersService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find()
      .populate('user.userId', '-password -confirmPassword ')
      .populate({
        path: 'orderItems.product',
        // Get users of product
        populate: { path: 'user', select: '-password -confirmPassword' },
      })
      .exec();

    const data = {
      orders,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successful Found all orders`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminGetOrderService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  if (!isValidMongooseObjectId(req.params.orderId) || !req.params.orderId) {
    return next(createHttpError(422, `Invalid request`));
  }
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('user.userId', '-password -confirmPassword ')
      .populate({
        path: 'orderItems.product',
        // Get users of product
        populate: { path: 'user', select: '-password -confirmPassword' },
      })
      .exec();

    if (!order) {
      return next(new createHttpError.BadRequest());
    }

    const data = {
      order,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found order by ID ${orderId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminGetAllOrdersForGivenUserService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.userId) || !req.params.userId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const { userId } = req.params;

    const orders = await Order.find({ 'user.userId': userId })
      .populate('user.userId', '-password -confirmPassword ')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'user', select: '-password -confirmPassword' },
      })
      .exec();

    const data = {
      orders,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: !orders.length
          ? `No order found for user by ID ${userId}`
          : `Successfully found  all order for user by ID ${userId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminDeleteSingleOrderService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.orderId) || !req.params.orderId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new createHttpError.BadRequest());
    }

    const isRemoved = await Order.findByIdAndRemove({
      _id: orderId,
    });

    if (!isRemoved) {
      return next(createHttpError(400, `Failed to delete order by given ID ${orderId}`));
    }

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted order by ID ${orderId}`,
        status: 200,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminDeleteAllOrderForGivenUserService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  if (!isValidMongooseObjectId(req.params.userId) || !req.params.userId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const { userId } = req.params;
    const droppedUserOrder = await Order.deleteMany({ 'user.userId': userId });

    if (droppedUserOrder.deletedCount === 0) {
      return next(createHttpError(400, `Failed to delete order for given user by ID ${userId}`));
    }

    return res.status(200).json(
      customResponse({
        data: null,
        success: true,
        error: false,
        message: `Successfully deleted all orders for user by ID ${userId}`,
        status: 200,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const adminUpdateOrderStatusService = async (
  req: AuthenticatedRequestBody<ProcessingOrderT>,
  res: Response,
  next: NextFunction
) => {
  const { orderStatus } = req.body;
  if (!isValidMongooseObjectId(req.params.orderId) || !req.params.orderId) {
    return next(createHttpError(422, `Invalid request`));
  }

  try {
    const { orderId } = req.params;
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        orderStatus,
      },
      {
        new: true,
      }
    )
      .populate('user.userId', '-password -confirmPassword ')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'user', select: '-password -confirmPassword' },
      })
      .exec();

    if (!order) {
      return next(new createHttpError.BadRequest());
    }
    const data = {
      order,
    };

    return res.status(201).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully update order by ID ${orderId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};
export const adminClearAllOrdersService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Delete complete Order collection
    const dropCompleteCollection = await Order.deleteMany({});

    if (dropCompleteCollection.deletedCount === 0) {
      return next(createHttpError(400, `Failed to Cleared orders`));
    }

    return res.status(200).send(
      customResponse({
        success: true,
        error: false,
        message: `Successful Cleared all orders`,
        status: 200,
        data: null,
      })
    );
  } catch (error) {
    return next(error);
  }
};
export const adminGetTopBestSellingService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  
}