export async function getSubscriptionByUserId(userId: string) { return null; }
export async function getPaymentsByUserId(userId: string) { return []; }
export async function cancelSubscription(userId: string) { return null; }
export async function updateSubscriptionPlan(userId: string, plan: string) { return null; }
export async function upsertSubscription(data: any) { return null; }
export async function getPaymentByStripeId(stripeId: string) { return null; }
export async function createPayment(data: any) { return null; }
export async function updatePaymentStatus(id: string, status: string) { return null; }
export async function getSubscriptionCountByStatus() { return []; }
export async function calculateMRR() { return 0; }
export async function getChurnRate() { return 0; }
export async function getTotalRevenue() { return 0; }
export async function getAllCustomersWithSubscriptions(params: any) { return []; }
export async function getCustomerWithSubscription(id: string) { return null; }
export async function updateCustomerSubscriptionStatus(id: string, status: string) { return null; }
