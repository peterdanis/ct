import { UpdateProductDto } from '@ct/dto';
import {
  axiosDelete,
  createProduct,
  createProductBody,
  get,
  patch,
  post,
} from './utils';
import { extractFirstKey } from '@ct/utils';

let productId: string;

beforeAll(async () => {
  const { data } = await createProduct();
  productId = data.productId;
});

describe('GET /products', () => {
  it('should return list of products', async () => {
    let product;
    let paginationToken;
    let status;

    while (!product) {
      const query = paginationToken
        ? `?paginationToken=${paginationToken}`
        : '';
      const { status: s, data } = await get(`/products${query}`);
      paginationToken = data.paginationToken;
      status = s;
      product = data.products.find((p) => (p.productId = productId));
    }

    expect(status).toBe(200);
    expect(product).toMatchInlineSnapshot(
      { productId: expect.any(String) },
      `
      {
        "description": "Product used for testing",
        "name": "Test product",
        "price": 9.99,
        "productId": Any<String>,
      }
    `
    );
  });

  it('should return paginationToken when there are a lot of products', async () => {
    let paginationToken;

    while (!paginationToken) {
      const { data } = await get(`/products`);
      paginationToken = data.paginationToken;

      if (paginationToken) {
        break;
      }
      await Promise.all(
        new Array(3000).fill(undefined).map(async () => createProduct())
      );
    }

    expect(paginationToken).toBeDefined();
  }, 60000); // increase timeout due to cache

  it('should return 400 when invalid paginationToken is used', async () => {
    const { status } = await get(`/products?paginationToken=invalid`);

    expect(status).toBe(400);
  });
});

describe('POST /products', () => {
  it('should return created product', async () => {
    const { status, data } = await post(`/products`, {
      ...createProductBody,
      name: 'Another test product',
    });

    expect(status).toBe(201);
    expect(data).toMatchInlineSnapshot(
      { productId: expect.any(String) },
      `
      {
        "description": "Product used for testing",
        "name": "Another test product",
        "price": 9.99,
        "productId": Any<String>,
      }
    `
    );
  });

  it('should return 400 when request body is invalid', async () => {
    const { status, data } = await post(`/products`, {
      name: 0,
    });

    expect(status).toBe(400);
    expect(data).toMatchInlineSnapshot(`
      {
        "error": "Bad Request",
        "message": [
          "name must be a string",
          "description should not be empty",
          "description must be a string",
          "price must not be less than 0",
          "price must be a number conforming to the specified constraints",
        ],
        "statusCode": 400,
      }
    `);
  });
});

describe('GET /products/:id', () => {
  it('should return product', async () => {
    const { status, data } = await get(`/products/${productId}`);

    expect(status).toBe(200);
    expect(data).toMatchInlineSnapshot(
      { productId: expect.any(String) },
      `
      {
        "description": "Product used for testing",
        "name": "Test product",
        "price": 9.99,
        "productId": Any<String>,
      }
    `
    );
  });

  it('should return 404 when product is not found', async () => {
    const { status, data } = await get(`/products/non-existing-product`);

    expect(status).toEqual(404);
    expect(data).toMatchInlineSnapshot(`
        {
          "message": "Not Found",
          "statusCode": 404,
        }
      `);
  });
});

describe('PATCH /products/:id', () => {
  it('should return updated product', async () => {
    const { status, data } = await patch(`/products/${productId}`, {
      name: 'New test product name',
    });

    expect(status).toBe(200);
    expect(data).toMatchInlineSnapshot(
      { productId: expect.any(String) },
      `
      {
        "description": "Product used for testing",
        "name": "New test product name",
        "price": 9.99,
        "productId": Any<String>,
      }
    `
    );
  });

  const updateTestCases: UpdateProductDto[] = [
    { name: 'Another new test product name' },
    { description: 'New description' },
    { price: 5.55 },
  ];
  it.each(updateTestCases)('should update property %s', async (payload) => {
    const { status, data } = await patch(`/products/${productId}`, payload);

    const key = extractFirstKey(payload);

    expect(status).toBe(200);
    expect(data[key]).toEqual(payload[key]);
  });
});

describe('DELETE /products/:id', () => {
  it('should return 204', async () => {
    const { status } = await axiosDelete(`/products/${productId}`);

    expect(status).toBe(204);
  });

  it('should return 404 when product is not found', async () => {
    const { status } = await axiosDelete(`/products/${productId}`);

    expect(status).toEqual(404);
  });
});
