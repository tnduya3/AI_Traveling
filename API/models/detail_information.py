from sqlalchemy import Column, String, DateTime, ForeignKey
from database import Base

class DetailInformation(Base):
    # Table name
    __tablename__ = "DetailInformations"

    idDetail = Column(String(6), primary_key=True, index=True)
    idPlace = Column(String(6), ForeignKey("Places.idPlace"), index=True) # Foreign key
    idTrip = Column(String(6), ForeignKey("Trips.idTrip"), index=True) # Foreign key
    startTime = Column(DateTime)
    endTime = Column(DateTime)
    note = Column(String(1000))
    