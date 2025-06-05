from pydantic import BaseModel

class DetailBookingBase(BaseModel):
    idUser: str
    idBooking: str

class DetailBookingResponse(DetailBookingBase):
    class Config:
        from_attributes = True

class DetailBookingCreate(DetailBookingBase):
    pass