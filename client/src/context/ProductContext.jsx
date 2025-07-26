import { createContext, useContext, useReducer } from 'react';

// Action types
const PRODUCT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

const initialState = {
  products: [],
  loading: false,
  error: null,
};

const ProductContext = createContext();

const productReducer = (state, action) => {
  switch (action.type) {
    case PRODUCT_ACTIONS.SET_LOADING:
      return { ...state, loading: true };

    case PRODUCT_ACTIONS.SET_PRODUCTS:
      return {
        ...state,
        loading: false,
        products: action.payload,
        error: null,
      };

    case PRODUCT_ACTIONS.SET_ERROR:
      return { ...state, loading: false, error: action.payload };

    case PRODUCT_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

// Optional: Export actions for cleaner dispatch usage
export { PRODUCT_ACTIONS };
