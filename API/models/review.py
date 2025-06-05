from sqlalchemy import Column, String, Integer, ForeignKey
from database import Base

# Model Review
class Review(Base):
    __tablename__ = 'Reviews'  # Tên bảng trong cơ sở dữ liệu

    idReview = Column(String(6), primary_key=True, index=True)  # Khóa chính
    idTrip = Column(String(6), ForeignKey("Trips.idTrip"), index=True)  # Khóa ngoại liên kết với bảng Trip
    idUser = Column(String(6), ForeignKey("Users.idUser"), index=True)  # ID người dùng
    comment = Column(String(1000))  # Bình luận
    rating = Column(Integer)  # Đánh giá

    def __repr__(self):
        return f"<Review(IDReview={self.idReview}, IDTrip={self.idTrip}, IDUser={self.idUser}, Rating={self.rating})>"
