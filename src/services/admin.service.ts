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

    responseObject.users = results?.map((userDoc: any) => {
      return {
        ...userDoc._doc,
        request: {
          type: 'Get',
          description: 'Get user info',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/admin/users/${userDoc._doc._id}`,
        },
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
      return next(new createHttpError.BadRequest());
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








