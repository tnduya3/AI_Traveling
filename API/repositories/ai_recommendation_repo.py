from sqlalchemy.orm import Session
from models.ai_recommendation import AIRecommendation
from schemas.ai_recommendation_schema import AIRecCreate
from repositories import user_repo
from fastapi import HTTPException
import uuid
from services.gemini_service import gemini_service
import logging

# Get all AI recommendations
def get_aiRec(db: Session, skip: int, limit: int):
    return db.query(AIRecommendation).order_by(AIRecommendation.idAIRec).offset(skip).limit(limit).all()

# Get AI recommendation by
def get_aiRec_by_id(db: Session, idAIRec: str):
    return db.query(AIRecommendation).filter(AIRecommendation.idAIRec == idAIRec).first()
    
def get_aiRec_by_user(db: Session, idUser: str, skip: int, limit: int):
    if not user_repo.get_user_by(db, "idUser", idUser):
        raise HTTPException(404, "User not found")
    
    return db.query(AIRecommendation).filter(AIRecommendation.idUser == idUser).order_by(AIRecommendation.idAIRec).offset(skip).limit(limit).all()

# Post new AI recommendation
def create_aiRec(db: Session, aiRecommendation: AIRecCreate):
    if not user_repo.get_user_by(db, "idUser", aiRecommendation.idUser):
        raise HTTPException(404, "User not found")
    
    idAIRec = ""
    while not idAIRec or get_aiRec_by_id(db, idAIRec):
        idAIRec = f"AI{str(uuid.uuid4())[:4]}"

    db_AIRecommendation = AIRecommendation(idAIRec = idAIRec, idUser = aiRecommendation.idUser, input = aiRecommendation.input, output = "")
    db.add(db_AIRecommendation)
    db.commit()
    db.refresh(db_AIRecommendation)

    return db_AIRecommendation

# Delete AI recommendation
def delete_aiRec(db: Session, idAIRec: str):
    db_AIRecommendation = get_aiRec_by_id(db, idAIRec)

    if not db_AIRecommendation:
        raise HTTPException(404, "AI recommendation not found")
    
    db.delete(db_AIRecommendation)
    db.commit()
    return db_AIRecommendation

# Generate trip recommendation
def generate_trip_recommendation(db: Session, idUser: str, trip_request: dict):
    """Generate a trip recommendation based on user input"""
    if not user_repo.get_user_by(db, "idUser", idUser):
        raise HTTPException(404, "User not found")
    
    # Generate unique ID
    idAIRec = ""
    while not idAIRec or get_aiRec_by_id(db, idAIRec):
        idAIRec = f"AI{str(uuid.uuid4())[:4]}"
    
    # Convert trip request to input string
    input_text = f"Departure: {trip_request['departure']}, Destination: {trip_request['destination']}, People: {trip_request['people']}, Days: {trip_request['days']}, Time: {trip_request['time']}, Budget: {trip_request['money']}, Transportation: {trip_request['transportation']}, Style: {trip_request['travelStyle']}, Interests: {', '.join(trip_request['interests'])}, Accommodation: {trip_request['accommodation']}"
    
    # Generate intelligent recommendation
    output_text = generate_intelligent_recommendation(trip_request)
    
    # Save to database
    db_AIRecommendation = AIRecommendation(
        idAIRec=idAIRec,
        idUser=idUser,
        input=input_text,
        output=output_text
    )
    
    db.add(db_AIRecommendation)
    db.commit()
    db.refresh(db_AIRecommendation)
    
    return db_AIRecommendation

def generate_intelligent_recommendation(trip_request: dict) -> str:
    """Generate intelligent trip recommendation using Gemini AI"""
    
    try:
        # Use Gemini service to generate recommendation
        recommendation = gemini_service.generate_travel_recommendation(trip_request)
        logging.info("Successfully generated recommendation using Gemini AI")
        return recommendation
    
    except Exception as e:
        logging.error(f"Error in generate_intelligent_recommendation: {e}")
        # Fallback to simple recommendation if Gemini fails
        return _generate_simple_fallback_recommendation(trip_request)

def _generate_simple_fallback_recommendation(trip_request: dict) -> str:
    """Simple fallback recommendation if Gemini fails"""
    
    departure = trip_request.get('departure', '')
    destination = trip_request.get('destination', '')
    people = trip_request.get('people', 1)
    days = trip_request.get('days', 1)
    
    return f"""🌟 Gợi ý chuyến đi từ {departure} đến {destination}

📍 Thông tin cơ bản:
• Số người: {people} người
• Thời gian: {days} ngày
• Điểm đến: {destination}

🎯 Gợi ý tổng quát:
• Khám phá các điểm tham quan nổi tiếng
• Thử đặc sản địa phương
• Trải nghiệm văn hóa bản địa
• Chụp ảnh lưu niệm

💡 Lưu ý: Hệ thống AI tạm thời gặp sự cố. Vui lòng thử lại sau để có gợi ý chi tiết hơn.

✨ Chúc bạn có chuyến đi vui vẻ!"""