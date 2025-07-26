import { createContext, useContext, useReducer } from 'react';

// Action types for readability and prevention of typos
const ORDER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ORDERS: 'SET_ORDERS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',
};

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

const OrderContext = createContext();

const orderReducer = (state, action) => {
  switch (action.type) {
    case ORDER_ACTIONS.SET_LOADING:
      return { ...state, loading: true };

    case ORDER_ACTIONS.SET_ORDERS:
      return { ...state, loading: false, orders: action.payload, error: null };

    case ORDER_ACTIONS.ADD_ORDER:
      const exists = state.orders.find(order => order._id === action.payload._id);
      return exists
        ? state
        : { ...state, orders: [...state.orders, action.payload] };

    case ORDER_ACTIONS.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
      };

    case ORDER_ACTIONS.SET_ERROR:
      return { ...state, loading: false, error: action.payload };

    case ORDER_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};

// Optional: Export actions for consistent usage in dispatch
export { ORDER_ACTIONS };
