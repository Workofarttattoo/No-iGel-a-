export type Subscription = {
  userId: string;
  productId: string;
  status: "active" | "inactive";
  activatedAt?: string;
  expiresAt?: string;
};

const DEFAULT_DURATION_DAYS = 30;
const subscriptions = new Map<string, Subscription>();

const createInactiveSubscription = (userId: string): Subscription => ({
  userId,
  productId: "",
  status: "inactive"
});

const isExpired = (subscription: Subscription) => {
  if (!subscription.expiresAt) {
    return false;
  }
  return new Date(subscription.expiresAt).getTime() < Date.now();
};

export const getSubscription = (userId: string): Subscription => {
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

export const activateSubscription = (userId: string, productId: string): Subscription => {
  const activatedAt = new Date();
  const expiresAt = new Date(activatedAt.getTime() + DEFAULT_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const subscription: Subscription = {
    userId,
    productId,
    status: "active",
    activatedAt: activatedAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
  subscriptions.set(userId, subscription);
  return subscription;
};
