from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DetailInformationBase(BaseModel):
    idTrip: str
    idPlace: str
    startTime: datetime
    endTime: datetime
    note: str

class DetailResponse(DetailInformationBase):
    idDetail: str

    class Config:
        from_attributes = True
class DetailCreate(DetailInformationBase):
    note: Optional[str] = None

class DetailUpdate(DetailInformationBase):
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    note: Optional[str] = None
