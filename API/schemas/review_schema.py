from pydantic import BaseModel
from typing import Optional

class ReviewBase(BaseModel):
    idTrip: str
    idUser: str
    comment: str
    rating: int  

class ReviewResponse(ReviewBase):
    idReview: str
    
    class Config:
        from_attributes = True
class ReviewCreate(ReviewBase):
    comment: Optional[str] = None

class ReviewUpdate(ReviewBase):
    comment: Optional[str] = None
    rating: Optional[int] = None
