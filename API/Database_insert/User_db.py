import random
import string
import bcrypt
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

# Function để tạo ID ngẫu nhiên gồm 6 ký tự (sử dụng lại từ code hiện tại)
def generate_random_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Function để hash password
def hash_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def seed_users():
    db = sessionLocal()
    try:
        # Danh sách các người dùng mẫu
        users_data = [
            {
                "idUser": "U00001",
                "name": "Nguyễn Văn A",
                "username": "nguyenvana",
                "password": "password123",
                "gender": 1,  # 1: Nam
                "email": "nguyenvana@example.com",
                "phoneNumber": "0123456789",
                "theme": 0,
                "language": 0
            },
            {
                "idUser": "U00002",
                "name": "Trần Thị B",
                "username": "tranthib",
                "password": "password456",
                "gender": 0,  # 0: Nữ
                "email": "tranthib@example.com",
                "phoneNumber": "0987654321",
                "theme": 1,
                "language": 0
            },
            {
                "idUser": "U00003",
                "name": "Lê Văn C",
                "username": "levanc",
                "password": "password789",
                "gender": 1,
                "email": "levanc@example.com",
                "phoneNumber": "0369852147",
                "theme": 2,
                "language": 1
            },
            {
                "idUser": "U00004",
                "name": "Phạm Thị D",
                "username": "phamthid",
                "password": "passwordabc",
                "gender": 0,
                "email": "phamthid@example.com",
                "phoneNumber": "0741852963",
                "theme": 0,
                "language": 2
            },
            {
                "idUser": "U00005",
                "name": "Hoàng Văn E",
                "username": "hoangvane",
                "password": "passworddef",
                "gender": 1,
                "email": "hoangvane@example.com",
                "phoneNumber": "0258963147",
                "theme": 1,
                "language": 1
            },
            {
                "idUser": "U00006",
                "name": "Vũ Thị F",
                "username": "vuthif",
                "password": "passwordxyz",
                "gender": 0,
                "email": "vuthif@example.com",
                "phoneNumber": "0963852741",
                "theme": 2,
                "language": 0
            },
            {
                "idUser": "U00007",
                "name": "Đỗ Văn G",
                "username": "dovang",
                "password": "passworduvw",
                "gender": 1,
                "email": "dovang@example.com",
                "phoneNumber": "0147852369",
                "theme": 0,
                "language": 1
            },
            {
                "idUser": "U00008",
                "name": "Ngô Thị H",
                "username": "ngothih",
                "password": "password321",
                "gender": 0,
                "email": "ngothih@example.com",
                "phoneNumber": "0852147963",
                "theme": 1,
                "language": 2
            },
            {
                "idUser": "U00009",
                "name": "Trịnh Văn I",
                "username": "trinhvani",
                "password": "password654",
                "gender": 1,
                "email": "trinhvani@example.com",
                "phoneNumber": "0321654987",
                "theme": 2,
                "language": 0
            },
            {
                "idUser": "U00010",
                "name": "Lý Thị K",
                "username": "lythik",
                "password": "password987",
                "gender": 0,
                "email": "lythik@example.com",
                "phoneNumber": "0456789123",
                "theme": 0,
                "language": 1
            }
        ]
        
        # Thêm người dùng vào database
        for user_data in users_data:
            # Kiểm tra xem user đã tồn tại chưa
            existing_user = db.query(User).filter(User.idUser == user_data["idUser"]).first()
            if existing_user:
                print(f"Người dùng {user_data['name']} đã tồn tại, bỏ qua.")
                continue
                
            # Hash password trước khi lưu vào database
            hashed_password = hash_password(user_data["password"])
            
            user = User(
                idUser=user_data["idUser"],
                name=user_data["name"],
                username=user_data["username"],
                password=hashed_password,
                gender=user_data["gender"],
                email=user_data["email"],
                phoneNumber=user_data["phoneNumber"],
                theme=user_data["theme"],
                language=user_data["language"]
            )
            db.add(user)
        
        db.commit()
        print(f"Đã thêm {len(users_data)} người dùng mẫu vào database!")
        
    except Exception as e:
        db.rollback()
        print(f"Lỗi khi thêm dữ liệu mẫu User: {e}")
    finally:
        db.close()

# Uncomment dòng dưới để chạy hàm khi file này được thực thi trực tiếp
if __name__ == "__main__":
    seed_users()