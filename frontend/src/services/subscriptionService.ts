import api from './apiService';

export interface SubscriptionStatus {
  is_subscribed: boolean;
  user_id: number;
}

export interface PaymentData {
  amount: number;
  payment_method: string;
  transaction_number: string;
  transaction_type: 'upi' | 'card' | 'netbanking' | 'wallet';
  plan_type: string;
  billing_cycle: 'monthly' | 'yearly';
}

export interface SubmitPaymentData {
  payment_id: number;
  transaction_number: string;
  transaction_type: 'upi' | 'card' | 'netbanking' | 'wallet';
}

class SubscriptionService {
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await api.get('/users/subscription/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  }

  async createPayment(paymentData: PaymentData) {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async submitPayment(submitData: SubmitPaymentData) {
    try {
      const response = await api.post('/payments/submit', submitData);
      return response.data;
    } catch (error) {
      console.error('Error submitting payment:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: number) {
    try {
      const response = await api.get(`/payments/${paymentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }

  async getUserPayments() {
    try {
      const response = await api.get('/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
