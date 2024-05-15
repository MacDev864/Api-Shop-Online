import { NextFunction, Request, Response } from 'express';

import createHttpError, { InternalServerError } from 'http-errors';

import User from '../models/User.model';
import { customResponse, deleteFile } from '../utils';
import {
  AddCommentT,
  AuthenticatedRequestBody,
  IUser,
  IPost,
  TPaginationResponse,
  UpdateCommentT,
  CommentI,
  LikeT,
} from '../interfaces';
import Post from '../models/Post.model';
import { cloudinary } from '../middlewares';

export const createPostService = async (req: AuthenticatedRequestBody<IPost>, res: Response, next: NextFunction) => {
  const { title, content, category } = req.body;

  // console.log(req.body, req.file);

  try {
    let cloudinaryResult;
    if (req.file?.filename) {
      const localFilePath = `${process.env.PWD}/public/uploads/posts/${req.file?.filename}`;
      cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
        folder: 'posts',
      });

      // Remove file from local uploads folder
      deleteFile(localFilePath);
    }

    const postData = new Post({
      title,
      content,
      category: category?.toLocaleLowerCase(),
      postImage: cloudinaryResult?.secure_url,
      cloudinary_id: cloudinaryResult?.public_id,
      author: req?.user?._id || '',
    });

    const createdPost = await Post.create(postData);

    const data = {
      post: {
        ...createdPost._doc,
        author: {
          _id: req?.user?._id || '',
          username: req?.user?.username || '',
     
        },
      },
      request: {
        type: 'Get',
        description: 'Get all posts',
        url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
      },
    };

    return res.status(201).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully added new post`,
        status: 201,
        data,
      })
    );
  } catch (error) {
    // Remove file from local uploads folder
    if (req.file?.filename) {
      const localFilePath = `${process.env.PWD}/public/uploads/posts/${req.file?.filename}`;
      deleteFile(localFilePath);
    }
    return next(InternalServerError);
  }
};

export const getPostsService = async (_req: Request, res: TPaginationResponse) => {
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

    responseObject.posts = (results as Array<{ _doc: IPost }>).map((postDoc) => {
      return {
        ...postDoc._doc,
        request: {
          type: 'Get',
          description: 'Get one post with the id',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts/${postDoc._doc._id}`,
        },
      };
    });

    return res.status(200).send(
      customResponse<typeof responseObject>({
        success: true,
        error: false,
        message: responseObject.posts.length ? 'Successful Found posts' : 'No post found',
        status: 200,
        data: responseObject,
      })
    );
  }
};

export const getPostService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    const data = {
      post: {
        ...post._doc,
        request: {
          type: 'Get',
          description: 'Get all posts',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found post by ID: ${req.params.postId}`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};









export const updateCommentInPostService = async (
  req: AuthenticatedRequestBody<UpdateCommentT>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, commentId, comment } = req.body;

    const post = await Post.findById(postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    const isAlreadyComment = post.comments.find(
      (item: { user: IUser; _id: string }) =>
        item.user?._id.toString() === req.user?._id.toString() && item?._id.toString() === commentId.toString()
    );

    if (!isAlreadyComment) {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    post.comments.forEach((item: { user: IUser; _id: string }, index: number) => {
      if (item?._id.toString() === commentId) {
        const newComment = {
          user: item.user,
          _id: item._id,
          comment,
        };

        post.comments[index] = newComment;
      }
    });

    await post.save();

    const data = {
      post: {
        ...post._doc,
        request: {
          type: 'Get',
          description: 'Get all posts',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully update comment  by ID : ${commentId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const getCommentInPostService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    const isCommentExists = post.comments.find(
      (item: { user: IUser; _id: string }) => item?._id.toString() === commentId.toString()
    );

    if (!isCommentExists) {
      return next(new createHttpError.BadRequest());
    }

    post.comments = post.comments.filter(
      (item: { user: IUser; _id: string }) =>
        item.user?._id.toString() === req.user?._id.toString() && item?._id.toString() === commentId.toString()
    );

    const { comments } = post._doc;

    const data = {
      comment: comments[0],
      request: {
        type: 'Get',
        description: 'Get all posts',
        url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found comment by ID : ${commentId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const getAllCommentInPostService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post || !post.comments.length) {
      return next(new createHttpError.BadRequest());
    }

    const comments = post.comments.map((commentDoc: { _doc: CommentI }) => {
      return {
        ...commentDoc._doc,
        request: {
          type: 'Get',
          description: 'Get one comment with the id',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts/comment/${req.params.postId}/${commentDoc._doc._id}`,
        },
      };
    });

    const data = {
      comments,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found all comments for post by ID : ${req.params.postId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const getUserCommentInPostService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post || !post.comments.length) {
      return next(new createHttpError.BadRequest());
    }

    const isAlreadyComment = post.comments.find(
      (com: { user: IUser }) => com.user?._id.toString() === req.user?._id.toString()
    );

    if (!isAlreadyComment) {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    post.comments = post.comments.filter(
      (com: { user: IUser }) => com.user?._id.toString() === req.user?._id.toString()
    );

    const comments = post.comments.map((commentDoc: { _doc: CommentI }) => {
      return {
        ...commentDoc._doc,
        request: {
          type: 'Get',
          description: 'Get one comment with the id',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts/comment/${req.params.postId}/${commentDoc._doc._id}`,
        },
      };
    });

    const data = {
      comments,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully found all your comment in post by ID : ${req.params.postId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const deleteAllCommentInPostService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post || !post?.comments?.length) {
      return next(new createHttpError.BadRequest());
    }

    // Allow only user who created the post or admin to delete the comment
    if (!req.user?._id.equals(post.author._id) && req?.user?.role !== 'admin') {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    post.comments = [];
    await post.save();

    const data = {
      post: {
        ...post._doc,
        request: {
          type: 'Get',
          description: 'Get all posts',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully deleted all comments in post by ID : ${req.params.postId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const deleteCommentInPostService = async (
  req: AuthenticatedRequestBody<UpdateCommentT>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, commentId } = req.body;

    const post = await Post.findById(postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post || !post?.comments?.length) {
      return next(new createHttpError.BadRequest());
    }

    const isAuthorized = post.comments.find(
      (item: { user: IUser; _id: string }) =>
        (req.user?._id.equals(post.author._id) || item.user?._id.toString() === req.user?._id.toString()) &&
        item?._id.toString() === commentId.toString()
    );

    if (!isAuthorized) {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    post.comments = post.comments.filter(
      (item: { user: IUser; _id: string }) => item?._id.toString() !== commentId?.toString()
    );

    await post.save();

    const data = {
      post: {
        ...post._doc,
        request: {
          type: 'Get',
          description: 'Get all posts',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully delete comment by ID : ${commentId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const deleteUserCommentInPostService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'name  surname  profileImage  bio')
      .populate('likes.user', 'name  surname  profileImage bio')
      .populate('comments.user', 'name  surname  profileImage bio')
      .exec();

    if (!post) {
      return next(new createHttpError.BadRequest());
    }

    if (req?.body?.userId) {
      const user = await User.findById(req.body.userId);
      if (!user) {
        return next(createHttpError(403));
      }
    }

    const isAlreadyComment = post.comments.find((item: { user: IUser }) =>
      item.user?._id.toString() === req?.body?.userId ? req?.body?.userId?.toString() : req.user?._id.toString()
    );

    // Allow only user who created the post or admin or user who add comment to delete the comments
    if (!isAlreadyComment && !req.user?._id.equals(post.author._id) && req?.user?.role !== 'admin') {
      return next(createHttpError(403, `Auth Failed (Unauthorized)`));
    }

    post.comments = post.comments.filter(
      (item: { user: IUser }) =>
        item.user?._id.toString() !== (req?.body?.userId ? req?.body?.userId?.toString() : req.user?._id.toString())
    );

    await post.save();

    const data = {
      post: {
        ...post._doc,
        request: {
          type: 'Get',
          description: 'Get all comments',
          url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts/comment/${req.params.postId}`,
        },
      },
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successfully deleted all user comments in post by ID : ${req.params.postId} `,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};
