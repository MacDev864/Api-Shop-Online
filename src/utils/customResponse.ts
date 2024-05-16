// import { ResponseT } from '@src/interfaces';

import { ResponseT } from "../interfaces";

export const customResponse = <T>({ data, success, error, message, status }: ResponseT<T>) => {
  return {
    data,
    message,
    error,

    success,
    status,
    
  };
};

export default customResponse;
