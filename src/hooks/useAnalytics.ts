import { useCallback } from 'react';

// Event categories
export type EventCategory = 
  | 'auth'
  | 'navigation'
  | 'form'
  | 'button'
  | 'diagnostic'
  | 'crm'
  | 'subscription'
  | 'content'
  | 'engagement';

// Event actions
export type EventAction =
  | 'click'
  | 'submit'
  | 'view'
  | 'start'
  | 'complete'
  | 'error'
  | 'upload'
  | 'download'
  | 'share'
  | 'search'
  | 'filter'
  | 'save'
  | 'delete'
  | 'navigate';

interface AnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

interface PageViewEvent {
  page: string;
  title?: string;
  referrer?: string;
}

/**
 * Custom analytics hook for tracking user interactions
 * Logs events to console in development, can be extended to send to analytics service
 */
export const useAnalytics = () => {
  // Track a custom event
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const timestamp = new Date().toISOString();
    const eventData = {
      ...event,
      timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Log to console for debugging
    if (import.meta.env.DEV) {
      console.log('[Analytics Event]', eventData);
    }

    // Store in sessionStorage for debugging/viewing
    try {
      const events = JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
      events.push(eventData);
      // Keep last 100 events
      if (events.length > 100) events.shift();
      sessionStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (e) {
      // Ignore storage errors
    }

    // Future: Send to analytics service
    // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(eventData) });
  }, []);

  // Track page views
  const trackPageView = useCallback((event: PageViewEvent) => {
    const timestamp = new Date().toISOString();
    const pageViewData = {
      type: 'pageview',
      ...event,
      timestamp,
      referrer: event.referrer || document.referrer,
    };

    if (import.meta.env.DEV) {
      console.log('[Analytics PageView]', pageViewData);
    }

    try {
      const pageViews = JSON.parse(sessionStorage.getItem('analytics_pageviews') || '[]');
      pageViews.push(pageViewData);
      if (pageViews.length > 50) pageViews.shift();
      sessionStorage.setItem('analytics_pageviews', JSON.stringify(pageViews));
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  // Convenience methods for common events
  const trackButtonClick = useCallback((buttonName: string, metadata?: Record<string, unknown>) => {
    trackEvent({
      category: 'button',
      action: 'click',
      label: buttonName,
      metadata,
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, success: boolean, metadata?: Record<string, unknown>) => {
    trackEvent({
      category: 'form',
      action: success ? 'complete' : 'error',
      label: formName,
      metadata,
    });
  }, [trackEvent]);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    trackEvent({
      category: 'engagement',
      action: 'search',
      label: searchTerm,
      value: resultsCount,
    });
  }, [trackEvent]);

  const trackAuth = useCallback((action: 'signin' | 'signup' | 'signout' | 'reset_password', success: boolean) => {
    trackEvent({
      category: 'auth',
      action: success ? 'complete' : 'error',
      label: action,
    });
  }, [trackEvent]);

  const trackDiagnostic = useCallback((action: EventAction, equipmentType?: string, metadata?: Record<string, unknown>) => {
    trackEvent({
      category: 'diagnostic',
      action,
      label: equipmentType,
      metadata,
    });
  }, [trackEvent]);

  const trackCRM = useCallback((action: EventAction, entityType: string, metadata?: Record<string, unknown>) => {
    trackEvent({
      category: 'crm',
      action,
      label: entityType,
      metadata,
    });
  }, [trackEvent]);

  const trackShare = useCallback((platform: string, contentType?: string) => {
    trackEvent({
      category: 'engagement',
      action: 'share',
      label: platform,
      metadata: { contentType },
    });
  }, [trackEvent]);

  const trackFileUpload = useCallback((fileType: string, fileSize?: number) => {
    trackEvent({
      category: 'engagement',
      action: 'upload',
      label: fileType,
      value: fileSize,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmit,
    trackSearch,
    trackAuth,
    trackDiagnostic,
    trackCRM,
    trackShare,
    trackFileUpload,
  };
};

export default useAnalytics;
