from pydantic import BaseModel
from typing import Optional

class NotificationBase(BaseModel):
    content: str

class NotificationResponse(NotificationBase):
    idNotf: str
    idUser: str
    isRead: bool
    class Config:
        from_attributes = True

class NotificationCreate(NotificationBase):
    idUser: str

class NotificationUpdate(NotificationBase):
    content: Optional[str] = None
    isRead: bool