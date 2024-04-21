import {
  createProduct,
  createReview,
  createReviewBody,
  get,
  post,
} from './utils';

let productId: string;
let reviewId: string;

beforeAll(async () => {
  const { data: productData } = await createProduct();
  productId = productData.productId;
  const { data: reviewData } = await createReview(productId);
  reviewId = reviewData.reviewId;
});

describe('GET /products/:id/reviews', () => {
  it('should return list of reviews for given product', async () => {
    const { status, data } = await get(`/products/${productId}/reviews`);

    const { reviews } = data;

    expect(status).toBe(200);
    expect(reviews.length > 0).toBeTruthy();
    expect(reviews.find((r) => r.reviewId === reviewId)).toMatchInlineSnapshot(
      {
        productId: expect.any(String),
        reviewId: expect.any(String),
      },
      `
      {
        "firstName": "Test",
        "lastName": "Case",
        "productId": Any<String>,
        "rating": 4,
        "reviewId": Any<String>,
        "reviewText": "Great test product!",
      }
    `
    );
  });

  it('should return 404 when product does not exists', async () => {
    const { status } = await get(`/products/non-existing-product/reviews`);

    expect(status).toBe(404);
  });
});

describe('POST /products/:id/reviews', () => {
  it('should return created review', async () => {
    const { status, data } = await post(`/products/${productId}/reviews`, {
      ...createReviewBody,
      reviewText: 'Another great review!',
    });

    expect(status).toBe(201);
    expect(data).toMatchInlineSnapshot(
      {
        productId: expect.any(String),
        reviewId: expect.any(String),
      },
      `
      {
        "firstName": "Test",
        "lastName": "Case",
        "productId": Any<String>,
        "rating": 4,
        "reviewId": Any<String>,
        "reviewText": "Another great review!",
      }
    `
    );
  });

  it('should return 400 when request body is invalid', async () => {
    const { status, data } = await post(`/products/${productId}/reviews`, {
      rating: 0,
    });

    expect(status).toBe(400);
    expect(data).toMatchInlineSnapshot(`
      {
        "error": "Bad Request",
        "message": [
          "firstName should not be empty",
          "firstName must be a string",
          "lastName should not be empty",
          "lastName must be a string",
          "reviewText should not be empty",
          "reviewText must be a string",
          "rating must not be less than 1",
        ],
        "statusCode": 400,
      }
    `);
  });

  it('should return 404 when product does not exists', async () => {
    const { status } = await post(
      `/products/non-existing-product/reviews`,
      createReviewBody
    );

    expect(status).toBe(404);
  });
});

describe.skip('TODO', () => {
  it('TODO', () => {
    // TODO: rest of the tests
    expect;
  });
});
