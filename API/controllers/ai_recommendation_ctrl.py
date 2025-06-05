from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from schemas import ai_recommendation_schema
from repositories import ai_recommendation_repo
from database import get_db
from controllers.auth_ctrl import get_current_user
import logging

router = APIRouter()

@router.get("/ai_recs", response_model=list[ai_recommendation_schema.AIRecResponse])
def get_ai_recs(db: Session = Depends(get_db), current_user = Depends(get_current_user), skip: int = 0, limit: int = 100):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return ai_recommendation_repo.get_aiRec(db, skip, limit)

@router.get("/ai_recs/id/{idAIRec}", response_model=ai_recommendation_schema.AIRecResponse)
def get_ai_rec_by_id(idAIRec: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    ai_rec = ai_recommendation_repo.get_aiRec_by_id(db, idAIRec)
    if not ai_rec:
        raise HTTPException(404, "AI recommendation not found")
    
    return ai_rec

@router.get("/ai_recs/user", response_model=list[ai_recommendation_schema.AIRecResponse])
def get_ai_rec_by_user(db: Session = Depends(get_db), current_user = Depends(get_current_user), skip: int = 0, limit: int = 100):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    ai_recs = ai_recommendation_repo.get_aiRec_by_user(db, current_user.idUser, skip, limit)
    if ai_recs == []:
        raise HTTPException(404, "AI recommendation not found")
    
    return ai_recs

@router.post("/ai_recs/", response_model=ai_recommendation_schema.AIRecResponse)
def create_ai_rec(ai_rec: ai_recommendation_schema.AIRecCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return ai_recommendation_repo.create_aiRec(db, ai_rec)

@router.delete("/ai_recs/{idAIRec}", response_model=ai_recommendation_schema.AIRecResponse)
def delete_ai_rec(idAIRec: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return ai_recommendation_repo.delete_aiRec(db, idAIRec)

@router.post("/ai_recs/generate-trip", response_model=ai_recommendation_schema.TripGenerateResponse)
def generate_trip_recommendation(
    trip_request: ai_recommendation_schema.TripGenerateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate a new trip recommendation using Gemini AI based on user input"""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Validate required fields
    if not trip_request.departure or not trip_request.destination:
        raise HTTPException(status_code=400, detail="Departure and destination are required")
    
    if trip_request.days <= 0 or trip_request.people <= 0:
        raise HTTPException(status_code=400, detail="Days and people must be positive numbers")
    
    # Convert request to dict for repository function
    trip_data = {
        "departure": trip_request.departure.strip(),
        "destination": trip_request.destination.strip(),
        "people": trip_request.people,
        "days": trip_request.days,
        "time": trip_request.time.strip() if trip_request.time else "",
        "money": trip_request.money.strip() if trip_request.money else "",
        "transportation": trip_request.transportation.strip() if trip_request.transportation else "",
        "travelStyle": trip_request.travelStyle.strip() if trip_request.travelStyle else "",
        "interests": [interest.strip() for interest in trip_request.interests if interest.strip()],
        "accommodation": trip_request.accommodation.strip() if trip_request.accommodation else ""
    }
    
    try:
        logging.info(f"Generating trip recommendation for user {current_user.idUser}: {trip_data['departure']} -> {trip_data['destination']}")
        
        # Generate recommendation using Gemini AI
        recommendation = ai_recommendation_repo.generate_trip_recommendation(
            db, current_user.idUser, trip_data
        )
        
        logging.info(f"Successfully generated recommendation {recommendation.idAIRec}")
        
        return ai_recommendation_schema.TripGenerateResponse(
            idAIRec=recommendation.idAIRec,
            recommendation=recommendation.output
        )
    except HTTPException:
        # Re-raise HTTP exceptions (like user not found)
        raise
    except Exception as e:
        logging.error(f"Unexpected error generating trip recommendation: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error while generating recommendation. Please try again later."
        )

@router.get("/ai_recs/health")
def check_ai_service_health(current_user = Depends(get_current_user)):
    """Check the health status of AI service (Gemini API)"""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    try:
        from services.gemini_service import gemini_service
        
        # Check if Gemini service is available
        if gemini_service.model:
            return {
                "status": "healthy",
                "ai_service": "Gemini AI",
                "model": "gemini-1.5-flash",
                "message": "AI service is running properly"
            }
        else:
            return {
                "status": "fallback",
                "ai_service": "Local Generation",
                "model": "fallback",
                "message": "Using local fallback due to Gemini API unavailability"
            }
    except Exception as e:
        logging.error(f"Error checking AI service health: {e}")
        return {
            "status": "error",
            "ai_service": "unknown",
            "model": "unknown",
            "message": f"Error checking service: {str(e)}"
        }

@router.post("/ai_recs/test-gemini")
def test_gemini_generation(
    trip_request: ai_recommendation_schema.TripGenerateRequest,
    current_user = Depends(get_current_user)
):
    """Test Gemini AI generation without saving to database"""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    from services.gemini_service import gemini_service
    from datetime import datetime
    
    # Convert request to dict
    trip_data = {
        "departure": trip_request.departure.strip(),
        "destination": trip_request.destination.strip(),
        "people": trip_request.people,
        "days": trip_request.days,
        "time": trip_request.time.strip() if trip_request.time else "",
        "money": trip_request.money.strip() if trip_request.money else "",
        "transportation": trip_request.transportation.strip() if trip_request.transportation else "",
        "travelStyle": trip_request.travelStyle.strip() if trip_request.travelStyle else "",
        "interests": [interest.strip() for interest in trip_request.interests if interest.strip()],
        "accommodation": trip_request.accommodation.strip() if trip_request.accommodation else ""
    }
    
    try:
        # Generate recommendation using Gemini
        recommendation = gemini_service.generate_travel_recommendation(trip_data)
        
        # Determine which service was used
        ai_service = "Gemini AI" if gemini_service.model else "Local Fallback"
        
        return {
            "success": True,
            "recommendation": recommendation,
            "ai_service": ai_service,
            "generated_at": datetime.now().isoformat(),
            "request_summary": f"{trip_data['departure']} → {trip_data['destination']} ({trip_data['days']} days, {trip_data['people']} people)",
            "characters_generated": len(recommendation)
        }
        
    except Exception as e:
        logging.error(f"Error testing Gemini generation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to test AI generation: {str(e)}")
