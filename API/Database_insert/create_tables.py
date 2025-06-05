from database import engine, Base
from models.token import Token
from models.user import User
from models.review import Review
from models.place import Place
from models.booking import Booking
from models.trip import Trip
from models.detail_booking import DetailBooking
from models.detail_information import DetailInformation
from models.friend import Friend
from models.notification import Notification
from models.trip_member import TripMember
from models.ai_recommendation import AIRecommendation

# Tạo tất cả các bảng trong cơ sở dữ liệu
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tất cả bảng đã được tạo thành công!")
    except Exception as e:
        print(f"❌ Lỗi khi tạo bảng: {e}")

if __name__ == "__main__":
    create_tables()
