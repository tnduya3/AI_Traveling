from database import Base
from sqlalchemy import Column, Integer, String

class Token(Base):
    __tablename__ = "Tokens"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))