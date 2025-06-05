from pydantic import BaseModel

class TripMemberBase(BaseModel):
    idTrip: str
    idUser: str

class TripMemberResponse(TripMemberBase):
    class Config:
        from_attributes = True

class TripMemberCreate(TripMemberBase):
    pass