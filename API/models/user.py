from sqlalchemy import Column, String, Integer, LargeBinary
from sqlalchemy.orm import relationship 
from database import Base

class User(Base):
    __tablename__ = "Users"

    idUser = Column(String(6), primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(200), nullable=False)
    gender = Column(Integer, nullable=True)
    email = Column(String(50), unique=True, nullable=True, index=True)
    phoneNumber = Column(String(10), nullable=True, index=True)
    avatar = Column(LargeBinary, nullable=True)
    theme = Column(Integer, nullable=True)
    language = Column(Integer, nullable=True)
    
    ai_recs = relationship("AIRecommendation", back_populates="owner_ai_rec", cascade="all, delete-orphan")
    
    sent_friends = relationship(
        "User",
        secondary="Friends",
        primaryjoin="User.idUser == Friend.idSelf",
        secondaryjoin="User.idUser == Friend.idFriend",
        backref="received_friends",
        cascade="all, delete"
    )
    
    notifies = relationship("Notification", back_populates="owner_notify", cascade="all, delete-orphan")
    
    trips = relationship("Trip", secondary="TripMembers", back_populates="members", cascade="all, delete")
    
    bookings = relationship("Booking", secondary="DetailBookings", back_populates="owner_booking", cascade="all, delete")
    
    reviewed = relationship("Trip", secondary="Reviews", back_populates="reviewed_by", cascade="all, delete")

