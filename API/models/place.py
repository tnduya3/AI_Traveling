from sqlalchemy import Column, String, Integer
from database import Base
from sqlalchemy.orm import relationship

class Place(Base):
    # Table name
    __tablename__ = "Places"

    idPlace = Column(String(6), primary_key=True, index=True)
    name = Column(String(50), index=True)
    country = Column(String(100), index=True)
    city = Column(String(100), index=True)
    province = Column(String(100), index=True)
    address = Column(String(1000))
    description = Column(String(1000))
    image = Column(String(1000))  # URL
    rating = Column(Integer)
    type = Column(Integer)
    
    books = relationship("Booking", back_populates="place", cascade="all, delete-orphan")
    
    trip_belong = relationship("Trip", secondary="DetailInformations", back_populates="place_contain", cascade="all, delete")