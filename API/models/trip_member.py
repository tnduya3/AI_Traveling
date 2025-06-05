from sqlalchemy import Column, String, ForeignKey
from database import Base

class TripMember(Base):
    __tablename__ = "TripMembers"

    idUser = Column(String(6), ForeignKey("Users.idUser"), primary_key=True, index=True)
    idTrip = Column(String(6), ForeignKey("Trips.idTrip"), primary_key=True, index=True)