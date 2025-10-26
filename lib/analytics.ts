import { createSupabaseAdmin } from './supabase/admin';

export interface TrackEventParams {
  event: string;
  userId?: string;
  companyId?: string;
  properties?: Record<string, any>;
}

/**
 * Track an analytics event in the database
 * @param params Event parameters
 * @returns Promise with the result of the insert operation
 */
export async function trackEvent(params: TrackEventParams) {
  try {
    const supabase = createSupabaseAdmin();
    
    const { event, userId, companyId, properties } = params;
    
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: event,
        user_id: userId,
        company_id: companyId,
        properties,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error tracking event:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Failed to track event:', err);
    return { success: false, error: err };
  }
}

/**
 * Track a company view event
 * @param companyId The ID of the company being viewed
 * @param userId Optional user ID of the viewer
 */
export async function trackCompanyView(companyId: string, userId?: string) {
  return trackEvent({
    event: 'company_view',
    companyId,
    userId,
    properties: { timestamp: new Date().toISOString() }
  });
}