from sqlalchemy.orm import Session
from database import engine, sessionLocal, Base
from models.token import Token
import auth as auth

# Tạo một phiên làm việc với cơ sở dữ liệu
db = sessionLocal()

def create_test_user():
    # Kiểm tra xem đã có người dùng test chưa
    test_user = db.query(Token).filter(Token.username == "test@example.com").first()
    
    if not test_user:
        # Tạo mật khẩu mã hóa
        hashed_password = auth.hash_password("password123")
        
        # Tạo người dùng mới
        new_user = Token(username="test@example.com", hashed_password=hashed_password)
        
        # Thêm vào cơ sở dữ liệu
        db.add(new_user)
        db.commit()
        print("✅ Đã tạo người dùng test thành công!")
    else:
        print("⚠️ Người dùng test đã tồn tại!")

if __name__ == "__main__":
    create_test_user()
    db.close()
