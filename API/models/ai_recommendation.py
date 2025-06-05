from sqlalchemy import Column, String, ForeignKey, Text
from database import Base
from sqlalchemy.orm import relationship

class AIRecommendation(Base):
    __tablename__ = "AIRecommendations"

    idAIRec = Column(String(6), primary_key=True, index=True)
    idUser = Column(String(6), ForeignKey("Users.idUser"), index=True)
    input = Column(Text)  # Changed from String(1000) to Text for longer input
    output = Column(Text)  # Changed from String(1000) to Text for longer recommendations
    
    owner_ai_rec = relationship("User", back_populates="ai_recs")