export interface UserSubscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  plan: string;
}

export async function getSubscriptionByUserId(userId: string): Promise<UserSubscription | null> { return null; }
export async function getPaymentsByUserId(userId: string): Promise<any[]> { return []; }
export async function cancelSubscription(userId: string): Promise<any> { return null; }
export async function updateSubscriptionPlan(userId: string, plan: string): Promise<any> { return null; }
export async function upsertSubscription(data: any): Promise<any> { return null; }
export async function getPaymentByStripeId(stripeId: string): Promise<any> { return null; }
export async function createPayment(data: any): Promise<any> { return null; }
export async function updatePaymentStatus(id: string, status: string): Promise<any> { return null; }
export async function getSubscriptionCountByStatus(): Promise<any[]> { return []; }
export async function calculateMRR(): Promise<number> { return 0; }
export async function getChurnRate(): Promise<number> { return 0; }
export async function getTotalRevenue(): Promise<number> { return 0; }
export async function getAllCustomersWithSubscriptions(params?: any): Promise<any[]> { return []; }
export async function getCustomerWithSubscription(id: string): Promise<any> { return null; }
export async function updateCustomerSubscriptionStatus(id: string, status: string): Promise<any> { return null; }

