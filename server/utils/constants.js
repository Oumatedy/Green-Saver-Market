module.exports = {
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    FARMER: 'farmer',
  },
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },
  PAYMENT_METHODS: ['card', 'bank_transfer', 'cash', 'mobile_money'],
  REFUND_METHODS: ['original', 'bank_transfer', 'credit'],
  CURRENCY_CODES: ['USD', 'EUR', 'KES'],
  DEFAULT_PAGINATION_LIMIT: 20,
  MAX_PAGINATION_LIMIT: 100,
};
