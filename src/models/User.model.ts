import bcrypt from 'bcrypt';
import mongoose, { Schema, Document, model, models } from 'mongoose';
import jwt from 'jsonwebtoken';

import { environmentConfig } from '../configs/custom-environment-variables.config';
import { CartItemT, IUser } from '../interfaces';
import { authorizationRoles } from '../constants';

export interface IUserDocument extends Document, IUser {
  // document level operations
  comparePassword(password: string): Promise<boolean>;
  createJWT(): Promise<void>;
  clearCart(): Promise<void>;
  addToCart(prodId: string, doDecrease: boolean): Promise<boolean>;
  removeFromCart(prodId: string): Promise<void>;
}

const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [false, 'Please provide name'],
      minLength: [3, "Name can't be smaller than 3 characters"],
      maxLength: [15, "Name can't be greater than 15 characters"],
      default:"Your name"
    },
    tel: {
      type: String,
      trim: true,
      lowercase: true,
      required: [false, 'Please provide tel'],
      minLength: [10, "tel can't be smaller than 10 characters"],
      maxLength: [10, "tel can't be greater than 10 characters"],
      default:""
    },
    address: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default:""
    },
    surname: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Please provide surname'],
      minLength: [3, "Surname can't be smaller than 3 characters"],
      maxLength: [15, "Surname can't be greater than 15 characters"],
      default:"Your surname"

    },
    email: {
      type: String,
      required: [false, 'Please provide email'],
      // a regular expression to validate an email address(stackoverflow)
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: false,
      trim: true,
      lowercase: true,
      maxLength: [128, "Email can't be greater than 128 characters"],
      index: false,
      default:"Youremail@exam.com"

    },
    username :{
      type: String,
      required: [true, 'Please provide username'],
      minlength: [6, 'Username must be more than 6 characters'],
      maxlength: [30,'Username must be more than 30 characters']
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [6, 'Password must be more than 6 characters'],
      trim: true,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please provide confirmed Password'],
      minlength: [6, 'Password must be more than 6 characters'],
      trim: true,
      select: false,
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // add relationship
            required: [true, 'Please provide Product'],
          },
          quantity: {
            type: Number,
            required: [true, 'Please provide quantity'],
          },
        },
      ],
    },
   
    role: {
      type: String,
      trim: true,
      lowercase: true,
      enum: [
        authorizationRoles.user,
        authorizationRoles.admin,
        authorizationRoles.superadmin,
      ],
      default: authorizationRoles.user,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'active',
      required: false,
      trim: true,
      lowercase: true,
    },
 

    gender: { type: String,
      enum: ['male', 'female','none'],
      trim: true, 
      lowercase: true,
      default : 'none' 
    },
    
  

    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

UserSchema.pre('save', async function (next) {
  if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
    console.log('Middleware called before saving the user is', this);
  }

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    user.confirmPassword = await bcrypt.hash(user.password, salt);
  }
  next();
});

UserSchema.post('save', function () {
  if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
    console.log('Middleware called after saving the user is (User is been Save )', this);
  }
});

UserSchema.methods.createJWT = function () {
  const payload = {
    userId: this._id,
    username: this.username,
    role: this.role,
  };

  return jwt.sign(payload, environmentConfig.TOKEN_SECRET as string, {
    expiresIn: environmentConfig.JWT_EXPIRE_TIME,
  });
};

UserSchema.methods.addToCart = function (prodId: string, doDecrease: boolean) {
  let cartProductIndex = -1;
  let updatedCartItems: CartItemT[] = [];

  if (this.cart.items) {
    cartProductIndex = this.cart.items.findIndex((cp: { productId: { toString: () => string } }) => {
      return cp.productId.toString() === prodId.toString();
    });
    updatedCartItems = [...this.cart.items];
  }

  let newQuantity = 1;
  if (cartProductIndex >= 0) {
    if (doDecrease) {
      newQuantity = this.cart.items[cartProductIndex].quantity - 1;
      if (newQuantity <= 0) {
        return this.removeFromCart(prodId);
      }
    } else {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    }
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: prodId,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  return this.save({ validateBeforeSave: false });
};

UserSchema.methods.removeFromCart = function (productId: string) {
  const updatedCartItems = this.cart.items.filter((item: { productId: { toString: () => string } }) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save({ validateBeforeSave: false });
};

UserSchema.methods.clearCart = async function (): Promise<boolean> {
  this.cart = { items: [] };
  return this.save({ validateBeforeSave: false });
};

export default models.User || model<IUserDocument>('User', UserSchema);
