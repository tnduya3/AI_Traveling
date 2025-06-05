from sqlalchemy import Column, String, Boolean, ForeignKey
from database import Base

class Friend(Base):
    __tablename__ = "Friends"

    idSelf = Column(String(6), ForeignKey("Users.idUser"), primary_key=True, index=True)
    idFriend = Column(String(6), ForeignKey("Users.idUser"), primary_key=True, index=True)
    isAccept = Column(Boolean)