import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';
import ResponseHandler from '@utils/responseHandler';
import { CreateProductInput, ProductQueryInput, UpdateProductInput } from './product.schema';
import { messages } from '../../constants';

// Helper untuk extract User ID
const getUserId = (req: Request): number => {
  // @ts-ignore
  return req.user?.id; 
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await productService.createProduct(req.body as CreateProductInput, userId);
    ResponseHandler.created(res, result, 'Product created successfully');
  } catch (error) {
    next(error);
  }
};

export const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as ProductQueryInput;
    const { data, meta } = await productService.getProducts(query);

    ResponseHandler.paginated(
      res, 
      data, 
      meta.page, 
      meta.limit, 
      meta.total, 
      'Products retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const findOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const result = await productService.getProductById(id);

    if (!result) {
        ResponseHandler.notFound(res, messages.ERROR.NOT_FOUND);
        return; 
    }

    ResponseHandler.success(res, result, 'Product retrieved successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      ResponseHandler.notFound(res, error.message);
      return;
    }
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const userId = getUserId(req);
    const result = await productService.updateProduct(id, req.body as UpdateProductInput, userId);
    
    ResponseHandler.success(res, result, 'Product updated successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      ResponseHandler.notFound(res, error.message);
      return;
    }
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const userId = getUserId(req);
    await productService.deleteProduct(id, userId);
    
    ResponseHandler.success(res, null, 'Product deleted successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      ResponseHandler.notFound(res, error.message);
      return;
    }
    next(error);
  }
};