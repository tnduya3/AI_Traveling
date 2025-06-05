from pydantic import BaseModel

class AIRecommendationBase(BaseModel):
    input: str
    idUser: str

class AIRecResponse(AIRecommendationBase):
    idAIRec: str
    output: str

    class Config:
        from_attributes = True

class AIRecCreate(AIRecommendationBase):
    pass

class AIRecUpdate(AIRecommendationBase):
    pass

# Schema cho API generate trip
class TripGenerateRequest(BaseModel):
    departure: str
    destination: str
    people: int
    days: int
    time: str
    money: str
    transportation: str
    travelStyle: str
    interests: list[str]
    accommodation: str

class TripGenerateResponse(BaseModel):
    idAIRec: str
    recommendation: str
    
    class Config:
        from_attributes = True

# Enhanced response with metadata
class TripGenerateResponseEnhanced(BaseModel):
    idAIRec: str
    recommendation: str
    ai_service: str = "Gemini AI"
    generated_at: str
    request_summary: str
    
    class Config:
        from_attributes = True

# Health check response
class AIServiceHealthResponse(BaseModel):
    status: str
    ai_service: str
    model: str
    message: str
