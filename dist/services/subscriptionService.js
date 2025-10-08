const DEFAULT_DURATION_DAYS = 30;
const subscriptions = new Map();
const createInactiveSubscription = (userId) => ({
    userId,
    productId: "",
    status: "inactive"
});
const isExpired = (subscription) => {
    if (!subscription.expiresAt) {
        return false;
    }
    return new Date(subscription.expiresAt).getTime() < Date.now();
};
export const getSubscription = (userId) => {
    const existing = subscriptions.get(userId);
    if (!existing) {
        return createInactiveSubscription(userId);
    }
    if (isExpired(existing)) {
        const inactive = createInactiveSubscription(userId);
        subscriptions.set(userId, inactive);
        return inactive;
    }
    return existing;
};
export const activateSubscription = (userId, productId) => {
    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt.getTime() + DEFAULT_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const subscription = {
        userId,
        productId,
        status: "active",
        activatedAt: activatedAt.toISOString(),
        expiresAt: expiresAt.toISOString()
    };
    subscriptions.set(userId, subscription);
    return subscription;
};
