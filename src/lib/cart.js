    // lib/cart.js
    export const getCart = () => {
        if (typeof window !== "undefined") {
        const storedCart = localStorage.getItem("cart");
        return storedCart ? JSON.parse(storedCart) : [];
        }
        return [];
    };
    
    export const saveCart = (cart) => {
        if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(cart));
        }
    };
    
    export const addToCart = (product) => {
        let cart = getCart();
        const existingItem = cart.find((item) => item.id === product.id && item.option === product.option);
    
        if (existingItem) {
        cart = cart.map((item) =>
            item.id === product.id && item.option === product.option
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
        } else {
        cart.push(product);
        }
    
        saveCart(cart);
        return cart;
    };
    
    export const updateQuantity = (id, option, quantity) => {
        let cart = getCart();
        cart = cart.map((item) =>
        item.id === id && item.option === option ? { ...item, quantity: Math.max(1, quantity) } : item
        );
    
        saveCart(cart);
        return cart;
    };
    
    export const removeFromCart = (id, option) => {
        let cart = getCart().filter((item) => !(item.id === id && item.option === option));
        saveCart(cart);
        return cart;
    };
    
    export const clearCart = () => {
        saveCart([]);
        return [];
    };
    