/**
 * Analytics & Telemetry Event Service
 * Captures non-sensitive operational and usage events across the ATS CV Optimizer app.
 * Does NOT record raw confidential CV body contents to ensure candidate data privacy.
 */

export type AnalyticsEventType =
  | 'WebsiteVisitor'
  | 'StartedOptimization'
  | 'UserRegistered'
  | 'UserLoggedIn'
  | 'CVUploaded'
  | 'CVParsed'
  | 'JobDescriptionSubmitted'
  | 'AnalysisStarted'
  | 'AnalysisCompleted'
  | 'OptimizationStarted'
  | 'OptimizationCompleted'
  | 'CVEdited'
  | 'CVDownloaded'
  | 'DocumentGenerated'
  | 'SubscriptionStarted'
  | 'SubscriptionCancelled'
  | 'AIRequest'
  | 'AIRequestFailed'
  | 'SecurityEvent';

export async function trackEvent(
  eventName: AnalyticsEventType,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const payload = {
      eventName,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
    };

    // Asynchronous non-blocking beacon to server endpoint
    if (typeof window !== 'undefined' && fetch) {
      fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn('Analytics event dispatch warning:', err));
    }
  } catch (err) {
    // Silent fail to avoid disrupting user workflow
    console.warn('TrackEvent error:', err);
  }
}
