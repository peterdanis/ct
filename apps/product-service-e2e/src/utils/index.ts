import axios from 'axios';
import {
  CreateProductDto,
  CreateReviewDto,
  ProductDto,
  ReviewDto,
} from '@ct/dto';

const baseURL = 'http://localhost:3000/api/v1';

export const extractFirstKey = (object) => Object.keys(object)[0];

export const {
  get,
  post,
  patch,
  delete: axiosDelete,
} = axios.create({
  baseURL,
  transformResponse: (res) =>
    typeof res === 'string' && res.length > 0 ? JSON.parse(res) : undefined,
  validateStatus: () => true,
});

export const createProductBody: CreateProductDto = {
  name: 'Test product',
  description: 'Product used for testing',
  price: 9.99,
};

export const createReviewBody: CreateReviewDto = {
  firstName: 'Test',
  lastName: 'Case',
  rating: 4,
  reviewText: 'Great test product!',
};

export const createProduct = async () =>
  post<ProductDto>('/products', createProductBody);

export const createReview = async (productId) =>
  post<ReviewDto>(`/products/${productId}/reviews`, createReviewBody);
