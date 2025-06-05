from sqlalchemy import Column, String, ForeignKey
from database import Base

class DetailBooking(Base):
    __tablename__ = "DetailBookings"

    idUser = Column(String(6), ForeignKey("Users.idUser"), primary_key=True, index=True)
    idBooking = Column(String(6), ForeignKey("Bookings.idBooking"), primary_key=True, index=True)