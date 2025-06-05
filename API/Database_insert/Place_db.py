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
# Function để tạo ID ngẫu nhiên gồm 6 ký tự (sử dụng lại từ code hiện tại)
def generate_random_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def seed_places():
    db = sessionLocal()
    try:
        # Danh sách các địa điểm mẫu
        places_data = [
            {
                "name": "Hạ Long Bay", 
                "country": "Vietnam", 
                "city": "Hạ Long", 
                "province": "Quảng Ninh",
                "address": "Hạ Long, Quảng Ninh, Vietnam",
                "description": "Vịnh Hạ Long là một vịnh nhỏ thuộc phần bờ tây vịnh Bắc Bộ tại khu vực biển Đông Bắc Việt Nam, bao gồm vùng biển đảo Hạ Long thành phố Hạ Long, thành phố Cẩm Phả và một phần của huyện đảo Vân Đồn.",
                "image": "https://example.com/images/halong.jpg",
                "rating": 9,
                "type": 1  # 1: Tourist attraction
            },
            {
                "name": "Hội An Ancient Town",
                "country": "Vietnam",
                "city": "Hội An",
                "province": "Quảng Nam",
                "address": "Hội An, Quảng Nam, Vietnam",
                "description": "Phố cổ Hội An là một thành phố cổ nằm ở hạ lưu sông Thu Bồn, tỉnh Quảng Nam, Việt Nam.",
                "image": "https://example.com/images/hoian.jpg",
                "rating": 8,
                "type": 1
            },
            {
                "name": "Sapa",
                "country": "Vietnam",
                "city": "Sapa",
                "province": "Lào Cai",
                "address": "Sapa, Lào Cai, Vietnam",
                "description": "Sa Pa là một thị xã thuộc tỉnh Lào Cai ở Tây Bắc Việt Nam. Thị xã này nổi tiếng với cảnh đẹp ruộng bậc thang và văn hóa đa dạng của các dân tộc thiểu số.",
                "image": "https://example.com/images/sapa.jpg",
                "rating": 8,
                "type": 1
            },
            {
                "name": "Angkor Wat",
                "country": "Cambodia",
                "city": "Siem Reap",
                "province": "Siem Reap",
                "address": "Siem Reap, Cambodia",
                "description": "Angkor Wat là một khu phức hợp đền thờ ở Cambodia và là đền thờ Ấn Độ giáo lớn nhất thế giới theo diện tích.",
                "image": "https://example.com/images/angkorwat.jpg",
                "rating": 9,
                "type": 1
            },
            {
                "name": "Bali",
                "country": "Indonesia",
                "city": "Denpasar",
                "province": "Bali",
                "address": "Bali, Indonesia",
                "description": "Bali là một hòn đảo và tỉnh của Indonesia. Đảo này nổi tiếng với các rặng núi lửa, đền đài cổ và bãi biển.",
                "image": "https://example.com/images/bali.jpg",
                "rating": 9,
                "type": 1
            },
            {
                "name": "Marina Bay Sands",
                "country": "Singapore",
                "city": "Singapore",
                "province": "Singapore",
                "address": "10 Bayfront Avenue, Singapore",
                "description": "Marina Bay Sands là một khu nghỉ dưỡng tích hợp ở Singapore, đứng trước Vịnh Marina.",
                "image": "https://example.com/images/mbs.jpg",
                "rating": 9,
                "type": 2  # 2: Hotel
            },
            {
                "name": "Kyoto",
                "country": "Japan",
                "city": "Kyoto",
                "province": "Kyoto Prefecture",
                "address": "Kyoto, Japan",
                "description": "Kyoto là một thành phố của Nhật Bản nằm ở phần trung tâm của đảo Honshu.",
                "image": "https://example.com/images/kyoto.jpg",
                "rating": 9,
                "type": 1
            },
            {
                "name": "Sydney Opera House",
                "country": "Australia",
                "city": "Sydney",
                "province": "New South Wales",
                "address": "Bennelong Point, Sydney, Australia",
                "description": "Nhà hát Opera Sydney là một trung tâm biểu diễn nghệ thuật nổi tiếng thế giới.",
                "image": "https://example.com/images/sydneyopera.jpg",
                "rating": 9,
                "type": 1
            },
            {
                "name": "Taj Mahal",
                "country": "India",
                "city": "Agra",
                "province": "Uttar Pradesh",
                "address": "Agra, Uttar Pradesh, India",
                "description": "Taj Mahal là một ngôi đền bằng đá cẩm thạch trắng nằm ở bờ nam sông Yamuna.",
                "image": "https://example.com/images/tajmahal.jpg",
                "rating": 10,
                "type": 1
            },
            {
                "name": "Grand Canyon",
                "country": "United States",
                "city": "Grand Canyon Village",
                "province": "Arizona",
                "address": "Grand Canyon Village, AZ, USA",
                "description": "Grand Canyon là một hẻm núi dốc và đầy màu sắc được khắc bởi sông Colorado ở Arizona.",
                "image": "https://example.com/images/grandcanyon.jpg",
                "rating": 9,
                "type": 1
            }
        ]
        
        # Thêm địa điểm vào database
        for place_data in places_data:
            place = Place(
                idPlace=generate_random_id(),
                name=place_data["name"],
                country=place_data["country"],
                city=place_data["city"],
                province=place_data["province"],
                address=place_data["address"],
                description=place_data["description"],
                image=place_data["image"],
                rating=place_data["rating"],
                type=place_data["type"]
            )
            db.add(place)
        
        db.commit()
        print(f"Đã thêm {len(places_data)} địa điểm mẫu vào database!")
        
    except Exception as e:
        db.rollback()
        print(f"Lỗi khi thêm dữ liệu mẫu Place: {e}")
    finally:
        db.close()

# Uncomment dòng dưới để chạy hàm khi file này được thực thi trực tiếp
if __name__ == "__main__":
    seed_places()