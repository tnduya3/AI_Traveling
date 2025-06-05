from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Booking(Base):
    # Table name
    __tablename__ = "Bookings"

    idBooking = Column(String(6), primary_key=True, index=True)
    idPlace = Column(String(6), ForeignKey("Places.idPlace"),index=True)
    date = Column(DateTime, index=True)
    status = Column(String(100))
    
    owner_booking = relationship("User", secondary="DetailBookings", back_populates="bookings")
    
    place = relationship("Place", back_populates="books")