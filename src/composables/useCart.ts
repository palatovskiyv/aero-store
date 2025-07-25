interface CartItem {
  id: string;
  quantity: number;
}

export const useCart = () => {
  // Проверка, доступен ли localStorage (client-side)
  const isClient = typeof window !== 'undefined';
  
  // Add a product to the cart
  const addToCart = (productId: string, quantity: number = 1) => {
    if (!isClient) return false;
    
    try {
      // Get the current cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
      
      // Check if the product already exists in the cart
      const existingItem = cart.find(item => item.id === productId);
      
      if (existingItem) {
        // If the product exists, add the specified quantity
        existingItem.quantity += quantity;
      } else {
        // If the product doesn't exist, add it with the specified quantity
        cart.push({ id: productId, quantity });
      }
      
      // Save the updated cart back to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return false;
    }
  };

  // Get the current cart
  const getCart = (): CartItem[] => {
    if (!isClient) return [];
    
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  };

  // Get the total number of items in the cart
  const getCartItemsCount = (): number => {
    if (!isClient) return 0;
    
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  
  // Remove a product from the cart
  const removeFromCart = (productId: string): boolean => {
    if (!isClient) return false;
    
    try {
      // Get the current cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
      
      // Find the index of the product to remove
      const productIndex = cart.findIndex(item => item.id === productId);
      
      // If the product exists, remove it
      if (productIndex !== -1) {
        cart.splice(productIndex, 1);
        
        // Save the updated cart back to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return false;
    }
  };

  return {
    addToCart,
    getCart,
    getCartItemsCount,
    removeFromCart
  };
}; 