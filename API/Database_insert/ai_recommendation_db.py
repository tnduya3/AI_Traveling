import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models.ai_recommendation import AIRecommendation
from database import sessionLocal
from models.place import Place
from models.user import User
from models.booking import Booking
from models.detail_booking import DetailBooking
from models.ai_recommendation import AIRecommendation
from models.detail_information import DetailInformation
from models.trip import Trip
from models.friend import Friend
from models.notification import Notification
from models.trip_member import TripMember
from models.review import Review

def insert_sample_ai_recommendations():
    db: Session = sessionLocal()
    try:
        samples = [
            AIRecommendation(
                idAIRec="AIREC1",
                idUser="U00001",
                input="Tôi muốn đi du lịch biển ở miền Bắc.",
                output="Bạn nên đến Hạ Long Bay ở Quảng Ninh để tận hưởng biển và cảnh đẹp thiên nhiên."
            ),
            AIRecommendation(
                idAIRec="AIREC2",
                idUser="U00002",
                input="Tôi thích khám phá di sản văn hóa tại miền Trung.",
                output="Hội An Ancient Town ở Quảng Nam là điểm đến lý tưởng cho bạn."
            ),
            AIRecommendation(
                idAIRec="AIREC3",
                idUser="U00003",
                input="Tôi muốn đi du lịch nước ngoài gần Việt Nam.",
                output="Bạn có thể tham khảo Angkor Wat ở Campuchia hoặc Marina Bay Sands ở Singapore."
            ),
            AIRecommendation(
                idAIRec="AIREC4",
                idUser="U00004",
                input="Tôi thích trải nghiệm núi rừng và khí hậu mát mẻ.",
                output="Sapa ở Lào Cai là lựa chọn tuyệt vời cho bạn."
            ),
            AIRecommendation(
                idAIRec="AIREC5",
                idUser="U00005",
                input="Tôi muốn đi du lịch cùng gia đình có trẻ nhỏ.",
                output="Bạn nên chọn Vinpearl Land ở Phú Quốc hoặc các khu nghỉ dưỡng tại Đà Nẵng."
            ),
        ]
        db.add_all(samples)
        db.commit()
        print("Sample AIRecommendation data inserted successfully.")
    except Exception as e:
        db.rollback()
        print("Error inserting sample data:", e)
    finally:
        db.close()

if __name__ == "__main__":
    insert_sample_ai_recommendations()
