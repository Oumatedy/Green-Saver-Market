const { 
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder 
} = require('../../controllers/orderController');
const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const { mockClerkMiddleware, createTestData } = require('../helpers/testSetup');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Order Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      auth: { userId: 'test-user-id' }
    };
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    beforeEach(() => {
      Order.create = jest.fn();
      Product.findById = jest.fn();
      Product.findByIdAndUpdate = jest.fn();
    });

    it('should create a new order', async () => {
      const orderData = createTestData.order;
      req.body = orderData;

      Product.findById.mockResolvedValueOnce({
        _id: 'test-product-id',
        stockQuantity: 10,
        price: 99.99
      });

      Order.create.mockResolvedValueOnce({
        ...orderData,
        _id: 'new-order-id',
        user: 'test-user-id'
      });

      await createOrder(req, res);

      expect(Order.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            order: expect.any(Object)
          })
        })
      );
    });

    it('should check stock availability', async () => {
      req.body = createTestData.order;

      Product.findById.mockResolvedValueOnce({
        _id: 'test-product-id',
        stockQuantity: 1, // Less than requested quantity
        price: 99.99
      });

      await createOrder(req, res);

      expect(Order.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getOrders', () => {
    beforeEach(() => {
      Order.find = jest.fn();
    });

    it('should get user orders', async () => {
      const orders = [
        { _id: 'order-1', user: 'test-user-id' },
        { _id: 'order-2', user: 'test-user-id' }
      ];

      Order.find.mockResolvedValueOnce(orders);

      await getOrders(req, res);

      expect(Order.find).toHaveBeenCalledWith({ user: 'test-user-id' });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            orders: expect.arrayContaining([
              expect.objectContaining({ _id: 'order-1' }),
              expect.objectContaining({ _id: 'order-2' })
            ])
          })
        })
      );
    });
  });

  describe('getOrderById', () => {
    beforeEach(() => {
      Order.findById = jest.fn();
    });

    it('should get order by id', async () => {
      const order = {
        _id: 'test-order-id',
        user: 'test-user-id',
        ...createTestData.order
      };

      Order.findById.mockResolvedValueOnce(order);
      req.params.id = 'test-order-id';

      await getOrderById(req, res);

      expect(Order.findById).toHaveBeenCalledWith('test-order-id');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            order: expect.objectContaining({ _id: 'test-order-id' })
          })
        })
      );
    });

    it('should return 404 for non-existent order', async () => {
      Order.findById.mockResolvedValueOnce(null);
      req.params.id = 'non-existent-id';

      await getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateOrder', () => {
    beforeEach(() => {
      Order.findById = jest.fn();
      Order.findByIdAndUpdate = jest.fn();
    });

    it('should update order status', async () => {
      const order = {
        _id: 'test-order-id',
        status: 'pending',
        ...createTestData.order
      };

      Order.findById.mockResolvedValueOnce(order);
      Order.findByIdAndUpdate.mockResolvedValueOnce({
        ...order,
        status: 'processing'
      });

      req.params.id = 'test-order-id';
      req.body = { status: 'processing' };
      req.auth.role = 'farmer';

      await updateOrder(req, res);

      expect(Order.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            order: expect.objectContaining({ status: 'processing' })
          })
        })
      );
    });
  });

  describe('cancelOrder', () => {
    beforeEach(() => {
      Order.findById = jest.fn();
      Order.findByIdAndUpdate = jest.fn();
    });

    it('should cancel order', async () => {
      const order = {
        _id: 'test-order-id',
        user: 'test-user-id',
        status: 'pending',
        ...createTestData.order
      };

      Order.findById.mockResolvedValueOnce(order);
      Order.findByIdAndUpdate.mockResolvedValueOnce({
        ...order,
        status: 'cancelled'
      });

      req.params.id = 'test-order-id';

      await cancelOrder(req, res);

      expect(Order.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });

    it('should not cancel processed order', async () => {
      const order = {
        _id: 'test-order-id',
        user: 'test-user-id',
        status: 'processing',
        ...createTestData.order
      };

      Order.findById.mockResolvedValueOnce(order);

      req.params.id = 'test-order-id';

      await cancelOrder(req, res);

      expect(Order.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
    mockRequest = {
      user: { id: 'test-user-id' },
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getUserOrders', () => {
    it('should return user orders', async () => {
      const mockOrders = [{ id: 1, user: 'test-user-id' }];
      orderService.getUserOrders.mockResolvedValue(mockOrders);

      await orderController.getUserOrders(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      orderService.getUserOrders.mockRejectedValue(error);

      await orderController.getUserOrders(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});
