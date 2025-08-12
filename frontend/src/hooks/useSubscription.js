import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionService } from '../services/subscriptionService';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    is_subscribed: false,
    loading: true,
    error: null
  });

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setSubscriptionStatus({
        is_subscribed: false,
        loading: false,
        error: null
      });
      return;
    }

    try {
      setSubscriptionStatus(prev => ({ ...prev, loading: true, error: null }));
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus({
        is_subscribed: status.is_subscribed,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionStatus({
        is_subscribed: false,
        loading: false,
        error: error.message || 'Failed to fetch subscription status'
      });
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user]);

  const refreshSubscriptionStatus = () => {
    fetchSubscriptionStatus();
  };

  return {
    ...subscriptionStatus,
    refreshSubscriptionStatus
  };
};
