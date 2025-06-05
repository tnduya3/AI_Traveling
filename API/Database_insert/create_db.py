from datetime import datetime, timedelta
import random
import string
from sqlalchemy.orm import Session
from database import sessionLocal, engine
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

# Function để tạo ID ngẫu nhiên gồm 6 ký tự
def generate_random_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Danh sách trạng thái booking
booking_statuses = ["CONFIRMED", "PENDING", "CANCELLED", "COMPLETED"]

def seed_bookings():
    db = sessionLocal()
    try:
        # Lấy danh sách place IDs và user IDs từ database
        place_ids = [place.idPlace for place in db.query(Place).all()]
        user_ids = [user.idUser for user in db.query(User).all()]
        
        # Kiểm tra xem có dữ liệu không
        if not place_ids:
            print("Không có dữ liệu Place trong database. Vui lòng thêm Place trước.")
            return
        
        if not user_ids:
            print("Không có dữ liệu User trong database. Vui lòng thêm User trước.")
            return
        
        # Tạo 15 booking mẫu
        for _ in range(15):
            # Tạo ngày booking ngẫu nhiên trong khoảng 30 ngày trước đến 60 ngày sau
            random_days = random.randint(-30, 60)
            booking_date = datetime.now() + timedelta(days=random_days)
            
            # Tạo booking mới
            new_booking = Booking(
                idBooking=generate_random_id(),
                idPlace=random.choice(place_ids),
                date=booking_date,
                status=random.choice(booking_statuses)
            )
            
            db.add(new_booking)
            db.flush()  # Flush để lấy ID của booking mới thêm vào
            
            # Tạo quan hệ với user (giả sử mỗi booking liên kết với 1 user)
            detail_booking = DetailBooking(
                idBooking=new_booking.idBooking,
                idUser=random.choice(user_ids)
            )
            
            db.add(detail_booking)
        
        db.commit()
        print("Đã thêm 15 booking mẫu vào database!")
        
    except Exception as e:
        db.rollback()
        print(f"Lỗi khi thêm dữ liệu mẫu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_bookings()