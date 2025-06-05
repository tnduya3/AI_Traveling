from pydantic import BaseModel
from datetime import datetime

class BookingBase(BaseModel):
    idPlace: str
    date: datetime
    status: str #Pending, success, failed

class BookingResponse(BookingBase):
    idBooking: str

    class Config:
        from_attributes = True

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BookingBase):
    pass