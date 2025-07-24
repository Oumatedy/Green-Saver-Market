const productController = require('../../controllers/productController');
const productService = require('../../services/productService');

jest.mock('../../services/productService');

describe('Product Controller', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [{ id: 1, name: 'Test Product' }];
      productService.getAllProducts.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      productService.getAllProducts.mockRejectedValue(error);

      await productController.getProducts(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});
