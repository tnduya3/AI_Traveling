import { getCookie } from 'cookies-next';

export interface TripGenerateRequest {
  departure: string;
  destination: string;
  people: number;
  days: number;
  time: string;
  money: string;
  transportation: string;
  travelStyle: string;
  interests: string[];
  accommodation: string;
}

export interface TripGenerateResponse {
  idAIRec: string;
  recommendation: string;
  ai_service?: string;
  generated_at?: string;
  request_summary?: string;
}

export const aiRecommendationService = {
  async generateTrip(request: TripGenerateRequest): Promise<TripGenerateResponse> {
    const token = getCookie('token');
    
    // Validate required fields
    if (!request.departure || !request.destination) {
      throw new Error('Departure and destination are required');
    }

    // Clean up the request data
    const cleanRequest = {
      ...request,
      interests: Array.isArray(request.interests) ? request.interests : [request.interests].filter(Boolean),
      people: Math.max(1, Number(request.people) || 1),
      days: Math.max(1, Number(request.days) || 1)
    };

    console.log('Sending AI recommendation request:', cleanRequest);
    
    const response = await fetch('http://127.0.0.1:8000/api/v1/ai_recs/generate-trip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cleanRequest)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI recommendation API error:', response.status, errorData);
      throw new Error(`API error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('AI recommendation response:', result);
    return result;
  },

  async getAllRecommendations(): Promise<any[]> {
    const token = getCookie('token');
    
    const response = await fetch('http://127.0.0.1:8000/api/v1/ai_recs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get all recommendations API error:', response.status, errorData);
      throw new Error(`API error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
    }

    return response.json();
  },

  async getUserRecommendations(userId: string): Promise<any[]> {
    const token = getCookie('token');
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Fetching recommendations for user:', userId);
    
    const response = await fetch(`http://127.0.0.1:8000/api/v1/ai_recs/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get user recommendations API error:', response.status, errorData);
      throw new Error(`API error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('User recommendations response:', result);
    return result;
  }
};
