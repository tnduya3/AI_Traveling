export interface AIRequest {
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

export async function generateTrip(input: AIRequest, token?: string): Promise<TripGenerateResponse> {
  // Clean and validate the input data
  const cleanInput = {
    departure: input.departure || "",
    destination: input.destination || "",
    people: Math.max(1, Number(input.people) || 1),
    days: Math.max(1, Number(input.days) || 1),
    time: input.time || "",
    money: input.money || "",
    transportation: input.transportation || "",
    travelStyle: input.travelStyle || "",
    interests: Array.isArray(input.interests) ? input.interests : [],
    accommodation: input.accommodation || ""
  };

  console.log("Sending trip generation request:", cleanInput);

  const res = await fetch(
    "http://127.0.0.1:8000/api/v1/ai_recs/generate-trip",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(cleanInput),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Trip generation API error:", res.status, errorData);
    throw new Error(`Lỗi API: ${res.status} - ${errorData.detail || "Không thể tạo kế hoạch du lịch"}`);
  }

  const data = await res.json();
  console.log("Trip generation response:", data);
  return data;
}
