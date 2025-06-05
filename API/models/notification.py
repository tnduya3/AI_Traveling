from sqlalchemy import Column, String, Boolean, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class Notification(Base):
    __tablename__ = "Notifications"

    idNotf = Column(String(6), primary_key=True, index=True)
    idUser = Column(String(6), ForeignKey("Users.idUser"), index=True)
    content = Column(String(1000))
    isRead = Column(Boolean)
    
    owner_notify = relationship("User", back_populates="notifies")