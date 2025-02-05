const CART_KEY = "cart";

/**
 * 获取购物车中的资源
 * @returns {Array} - 购物车中的资源数组
 */
export const getCartItems = () => {
    if (typeof window !== "undefined") {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }
    return [];
};

/**
 * 添加资源到购物车
 */
export const addToCart = (resource) => {
    if (typeof window !== "undefined") {
        let cart = getCartItems();
        if (!cart.some((item) => item.id === resource.id)) {
            cart.push(resource);
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        }
    }
};

/**
 * 从购物车中移除指定资源
 */
export const removeFromCart = (resourceId) => {
    if (typeof window !== "undefined") {
        let cart = getCartItems().filter((item) => item.id !== resourceId);
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
};

/**
 * 清空购物车
 */
export const clearCart = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(CART_KEY);
    }
};
