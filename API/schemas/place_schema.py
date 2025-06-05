from pydantic import BaseModel
from typing import Optional

class PlaceBase(BaseModel):
    name: str
    country: str
    city: str
    province: str
    address: str
    description: str
    image: str
    rating: int
    type: int

class PlaceResponse(PlaceBase):
    idPlace: str

    class Config:
        from_attributes = True
class PlaceCreate(PlaceBase):
    description: Optional[str]
    image: Optional[str]

class PlaceUpdate(PlaceBase):
    name: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[int] = None
    type: Optional[int] = None
