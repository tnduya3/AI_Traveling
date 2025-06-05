from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class TripBase(BaseModel):
    name: str
    startDate: datetime
    endDate: datetime
    
class TripResponse(TripBase):
    idTrip: str

    class Config:
        from_attributes = True

class TripCreate(TripBase):
    pass

class TripUpdate(TripBase):
    name: Optional[str] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None