from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Conversation(Base):
    __tablename__ = 'conversations'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_archived = Column(Boolean, nullable=False, default=False)
    metadata = Column(JSONB)
    
    # Relationship với messages
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_archived': self.is_archived,
            'metadata': self.metadata
        }

class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False)
    content = Column(Text, nullable=False)
    role = Column(String, nullable=False)  # 'user' hoặc 'assistant'
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    metadata = Column(JSONB)
    token_count = Column(Integer, nullable=False, default=0)
    
    # Relationship với conversation
    conversation = relationship("Conversation", back_populates="messages")
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'content': self.content,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'metadata': self.metadata,
            'token_count': self.token_count
        }

# Tạo indexes
Index('idx_conversations_user_id', Conversation.user_id)
Index('idx_conversations_created_at', Conversation.created_at)
Index('idx_messages_conversation_id', Message.conversation_id)
Index('idx_messages_created_at', Message.created_at)
