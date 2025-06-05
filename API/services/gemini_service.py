"""
Gemini AI Service for generating intelligent travel recommendations
"""
import google.generativeai as genai
import os
from dotenv import load_dotenv
from fastapi import HTTPException
import logging

# Load environment variables
load_dotenv()

# Configure Gemini API
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    logging.warning("GEMINI_API_KEY not found in environment variables. Using fallback mode.")
else:
    genai.configure(api_key=gemini_api_key)

class GeminiService:
    def __init__(self):
        self.model = None
        try:
            if gemini_api_key:
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logging.info("Gemini AI model initialized successfully")
            else:
                logging.warning("Gemini API key not found, falling back to local generation")
        except Exception as e:
            logging.error(f"Failed to initialize Gemini model: {e}")
            self.model = None

    def generate_travel_recommendation(self, trip_request: dict) -> str:
        """Generate travel recommendation using Gemini AI"""
        
        if not self.model:
            # Fallback to local generation if Gemini is not available
            return self._generate_local_recommendation(trip_request)
        
        try:
            # Create detailed prompt for Gemini
            prompt = self._create_travel_prompt(trip_request)
            
            # Generate content using Gemini
            response = self.model.generate_content(prompt)
            
            if response.text:
                return response.text
            else:
                logging.warning("Gemini returned empty response, falling back to local generation")
                return self._generate_local_recommendation(trip_request)
                
        except Exception as e:
            logging.error(f"Error generating recommendation with Gemini: {e}")
            # Fallback to local generation
            return self._generate_local_recommendation(trip_request)

    def _create_travel_prompt(self, trip_request: dict) -> str:
        """Create a detailed prompt for Gemini AI"""
        
        departure = trip_request.get('departure', '')
        destination = trip_request.get('destination', '')
        people = trip_request.get('people', 1)
        days = trip_request.get('days', 1)
        budget = trip_request.get('money', '')
        travel_style = trip_request.get('travelStyle', '')
        interests = trip_request.get('interests', [])
        accommodation = trip_request.get('accommodation', '')
        transportation = trip_request.get('transportation', '')
        time = trip_request.get('time', '')

        prompt = f"""
Bạn là một chuyên gia tư vấn du lịch thông minh với kinh nghiệm sâu rộng về du lịch Việt Nam và quốc tế. 
Hãy tạo một gợi ý du lịch chi tiết, thực tế và hấp dẫn dựa trên thông tin sau:

🌍 THÔNG TIN CHUYẾN ĐI:
- Điểm khởi hành: {departure}
- Điểm đến: {destination}
- Số người: {people} người
- Thời gian: {days} ngày ({time})
- Ngân sách: {budget}
- Phong cách du lịch: {travel_style}
- Sở thích: {', '.join(interests) if interests else 'Chưa có'}
- Loại accommodation: {accommodation}
- Phương tiện di chuyển: {transportation}

📋 YÊU CẦU PHẢN HỒI:
1. Tạo lộ trình chi tiết theo từng ngày với timeline cụ thể
2. Gợi ý địa điểm tham quan phù hợp với sở thích
3. Đề xuất nhà hàng/quán ăn địa phương ngon
4. Thông tin về accommodation phù hợp ngân sách
5. Chi phí ước tính cho từng hạng mục
6. Tips tiết kiệm và lưu ý quan trọng
7. Các hoạt động giải trí buổi tối
8. Thông tin thực tế về giao thông, thời tiết

💡 PHONG CÁCH PHẢN HỒI:
- Sử dụng emoji để làm bắt mắt
- Chia thành các section rõ ràng
- Đưa ra lý do tại sao chọn địa điểm đó
- Bao gồm thông tin giá cả cụ thể (VND)
- Mention các món ăn đặc sản phải thử
- Đưa ra alternative options

Hãy tạo một gợi ý toàn diện, thực tế và hữu ích cho chuyến đi này.
"""
        return prompt

    def _generate_local_recommendation(self, trip_request: dict) -> str:
        """Fallback function for local recommendation generation"""
        
        departure = trip_request.get('departure', '')
        destination = trip_request.get('destination', '')
        people = trip_request.get('people', 1)
        days = trip_request.get('days', 1)
        budget = trip_request.get('money', '')
        travel_style = trip_request.get('travelStyle', '')
        interests = trip_request.get('interests', [])
        accommodation = trip_request.get('accommodation', '')
        transportation = trip_request.get('transportation', '')

        recommendation = f"""🌟 GỢI Ý CHUYẾN ĐI TỪ {departure.upper()} ĐẾN {destination.upper()}

📍 THÔNG TIN CHUYẾN ĐI:
• Số người: {people} người
• Thời gian: {days} ngày
• Ngân sách: {budget}
• Phong cách: {travel_style}
• Sở thích: {', '.join(interests) if interests else 'Khám phá tổng quát'}

🏨 GỢI Ý LƯU TRÚ:
"""

        # Accommodation recommendations based on style and budget
        if travel_style == "luxury" or "cao cấp" in budget.lower():
            recommendation += """• Resort 5 sao hoặc khách sạn boutique cao cấp
• Dịch vụ spa và tiện nghi đầy đủ
• Vị trí trung tâm hoặc view đẹp
• Giá: 2-5 triệu VND/đêm
"""
        elif travel_style == "comfort" or "thoải mái" in travel_style:
            recommendation += """• Khách sạn 3-4 sao với đầy đủ tiện nghi
• Gần trung tâm và điểm tham quan
• Có hồ bơi và gym
• Giá: 800k-2 triệu VND/đêm
"""
        else:
            recommendation += """• Homestay hoặc khách sạn 2-3 sao
• Gần phương tiện công cộng
• Sạch sẽ và an toàn
• Giá: 300k-800k VND/đêm
"""

        recommendation += f"""
🚗 PHƯƠNG TIỆN DI CHUYỂN:
"""
        if transportation == "máy bay":
            recommendation += """• Đặt vé máy bay sớm để có giá tốt
• Check-in online để tiết kiệm thời gian
• Đến sân bay trước 2h (nội địa) hoặc 3h (quốc tế)
• Chi phí: 1-5 triệu VND/người
"""
        elif transportation == "xe khách":
            recommendation += """• Chọn xe giường nằm chất lượng cao
• Mang theo đồ ăn nhẹ và nước uống
• Đặt chỗ ngồi đầu xe để ít bị say
• Chi phí: 200k-600k VND/người
"""
        elif transportation == "tàu hỏa":
            recommendation += """• Đặt toa điều hòa để thoải mái hơn
• Mang theo sạc dự phòng
• Chuẩn bị đồ ăn cho chuyến đi dài
• Chi phí: 300k-800k VND/người
"""
        else:
            recommendation += f"""• Sử dụng {transportation} an toàn và tiện lợi
• Kiểm tra lộ trình trước khi khởi hành
• Chuẩn bị giấy tờ cần thiết
"""

        # Generate daily itinerary
        recommendation += f"""
📅 LỊCH TRÌNH CHI TIẾT:
"""
        
        for day in range(1, int(days) + 1):
            recommendation += f"""
NGÀY {day}:
🌅 Sáng (7:00-11:00):
• Ăn sáng tại khách sạn hoặc quán phở địa phương
• Tham quan điểm đến chính của {destination}
• Chụp ảnh check-in

🍽️ Trưa (11:00-14:00):
• Thưởng thức đặc sản địa phương
• Nghỉ ngơi tại accommodation
• Khám phá khu vực lân cận

🌆 Chiều (14:00-18:00):
• Tham quan điểm thứ hai
• Mua sắm quà lưu niệm
• Trải nghiệm văn hóa địa phương

🌙 Tối (18:00-22:00):
• Dạo chợ đêm hoặc khu phố cổ
• Thưởng thức ẩm thực đường phố
• Giải trí và nghỉ ngơi
"""

        # Interest-based activities
        recommendation += f"""
🎯 HOẠT ĐỘNG THEO SỞ THÍCH:
"""
        
        activity_map = {
            "ẩm thực": """• Thử món đặc sản địa phương
• Tham gia tour ẩm thực
• Ghé thăm chợ đêm và food court
• Học nấu món truyền thống
""",
            "văn hóa": """• Tham quan bảo tàng và di tích lịch sử
• Xem biểu diễn nghệ thuật truyền thống
• Tham gia lễ hội địa phương (nếu có)
• Ghé thăm làng nghề truyền thống
""",
            "thiên nhiên": """• Trekking và leo núi
• Tham quan vườn quốc gia
• Ngắm cảnh hoàng hôn/bình minh
• Khám phá động, thác nước
""",
            "biển": """• Tắm biển và thể thao nước
• Du thuyền ngắm cảnh
• Thưởng thức hải sản tươi sống
• Lặn ngắm san hô
""",
            "mạo hiểm": """• Thể thao mạo hiểm như zipline, bungee
• Khám phá hang động
• Hoạt động outdoor như rafting
• Paragliding hoặc skydiving
""",
            "thư giãn": """• Spa và massage thư giãn
• Yoga buổi sáng
• Đọc sách bên bãi biển/hồ bơi
• Meditation và tắm nắng
""",
            "shopping": """• Ghé thăm trung tâm thương mại
• Mua sắm đồ lưu niệm
• Khám phá các chợ truyền thống
• Săn sale và hàng hiệu
"""
        }
        
        for interest in interests:
            if interest.lower() in activity_map:
                recommendation += activity_map[interest.lower()]
        
        if not any(interest.lower() in activity_map for interest in interests):
            recommendation += """• Khám phá điểm tham quan nổi tiếng
• Trải nghiệm văn hóa địa phương
• Thưởng thức ẩm thực đặc sản
• Chụp ảnh và làm kỷ niệm
"""

        # Budget breakdown
        recommendation += f"""
💰 BẢNG CHI PHÍ ƯỚC TÍNH (cho {people} người):
"""
        
        if "dưới 5" in budget.lower():
            recommendation += """• Accommodation: 300k-500k VND/đêm
• Ăn uống: 200k-400k VND/người/ngày
• Di chuyển: 100k-300k VND/người/ngày
• Vé tham quan: 50k-200k VND/người
• Shopping: 200k-500k VND/người
• Tổng cộng: 3-5 triệu VND
"""
        elif "5" in budget and "10" in budget:
            recommendation += """• Accommodation: 800k-1.5 triệu VND/đêm
• Ăn uống: 400k-800k VND/người/ngày
• Di chuyển: 300k-600k VND/người/ngày
• Vé tham quan: 200k-500k VND/người
• Shopping: 500k-1 triệu VND/người
• Tổng cộng: 5-10 triệu VND
"""
        else:
            recommendation += """• Accommodation: 1.5-3 triệu VND/đêm
• Ăn uống: 800k-1.5 triệu VND/người/ngày
• Di chuyển: 600k-1.2 triệu VND/người/ngày
• Vé tham quan: 500k-1 triệu VND/người
• Shopping: 1-3 triệu VND/người
• Tổng cộng: 10+ triệu VND
"""

        # Tips and notes
        recommendation += f"""
🛡️ TIPS VÀ LƯU Ý:
• Mua bảo hiểm du lịch
• Chuẩn bị thuốc cá nhân
• Backup tài liệu quan trọng
• Thông báo lịch trình cho người thân
• Kiểm tra thời tiết trước khi đi
• Mang theo tiền mặt và thẻ ATM
• Tải app bản đồ offline
• Học vài câu tiếng địa phương

🍜 MÓN ĂN PHẢI THỬ:
• Đặc sản nổi tiếng của {destination}
• Bánh mì và cà phê Việt Nam
• Hải sản tươi sống (nếu gần biển)
• Chè và trái cây nhiệt đới

✨ Chúc bạn có chuyến đi {destination} thật vui vẻ và đáng nhớ!

📞 Liên hệ hỗ trợ:
• Tổng đài du lịch: 1900-xxxx
• Cấp cứu: 115
• Cảnh sát: 113
"""
        
        return recommendation

# Create singleton instance
gemini_service = GeminiService()
