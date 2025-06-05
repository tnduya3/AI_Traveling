from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship 
from database import Base
# from models.trip_member import TripMember

class Trip(Base):
    __tablename__ = "Trips"

    idTrip = Column(String(6), primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    startDate = Column(DateTime, nullable=False, index=True)
    endDate = Column(DateTime, nullable=True, index=True)
    
    members = relationship("User", secondary="TripMembers", back_populates="trips", cascade="all, delete")
    
    reviewed_by = relationship("User", secondary="Reviews", back_populates="reviewed", cascade="all, delete")
    
    place_contain = relationship("Place", secondary="DetailInformations", back_populates="trip_belong", cascade="all, delete")
