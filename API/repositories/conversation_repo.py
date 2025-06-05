from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, and_, or_
from typing import List, Optional, Dict, Any
from API.models.conversation import Conversation, Message
from API.schemas.conversation_schema import ConversationCreate, ConversationUpdate, MessageCreate
from datetime import datetime

class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_conversation(self, conversation_data: ConversationCreate) -> Conversation:
        """Tạo cuộc trò chuyện mới"""
        conversation = Conversation(
            user_id=conversation_data.user_id,
            title=conversation_data.title,
            metadata=conversation_data.metadata
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def get_conversation_by_id(self, conversation_id: str, include_messages: bool = False) -> Optional[Conversation]:
        """Lấy cuộc trò chuyện theo ID"""
        query = self.db.query(Conversation)
        if include_messages:
            query = query.options(joinedload(Conversation.messages))
        return query.filter(Conversation.id == conversation_id).first()

    def get_conversations_by_user(
        self, 
        user_id: str, 
        page: int = 1, 
        limit: int = 20,
        include_archived: bool = False,
        search: Optional[str] = None
    ) -> tuple[List[Conversation], int]:
        """Lấy danh sách cuộc trò chuyện của user với phân trang"""
        query = self.db.query(Conversation).filter(Conversation.user_id == user_id)
        
        if not include_archived:
            query = query.filter(Conversation.is_archived == False)
        
        if search:
            query = query.filter(Conversation.title.ilike(f"%{search}%"))
        
        # Đếm tổng số
        total = query.count()
        
        # Phân trang và sắp xếp
        conversations = query.order_by(desc(Conversation.updated_at))\
                           .offset((page - 1) * limit)\
                           .limit(limit)\
                           .all()
        
        return conversations, total

    def update_conversation(self, conversation_id: str, update_data: ConversationUpdate) -> Optional[Conversation]:
        """Cập nhật cuộc trò chuyện"""
        conversation = self.get_conversation_by_id(conversation_id)
        if not conversation:
            return None
        
        update_dict = update_data.dict(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(conversation, key, value)
        
        conversation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def delete_conversation(self, conversation_id: str) -> bool:
        """Xóa cuộc trò chuyện"""
        conversation = self.get_conversation_by_id(conversation_id)
        if not conversation:
            return False
        
        self.db.delete(conversation)
        self.db.commit()
        return True

    def archive_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """Lưu trữ cuộc trò chuyện"""
        return self.update_conversation(conversation_id, ConversationUpdate(is_archived=True))

class MessageRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_message(self, message_data: MessageCreate) -> Message:
        """Tạo tin nhắn mới"""
        message = Message(
            conversation_id=message_data.conversation_id,
            content=message_data.content,
            role=message_data.role,
            metadata=message_data.metadata,
            token_count=message_data.token_count or 0
        )
        self.db.add(message)
        
        # Cập nhật thời gian updated_at của conversation
        conversation = self.db.query(Conversation).filter(
            Conversation.id == message_data.conversation_id
        ).first()
        if conversation:
            conversation.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(message)
        return message

    def get_messages_by_conversation(
        self, 
        conversation_id: str,
        page: int = 1,
        limit: int = 50
    ) -> tuple[List[Message], int]:
        """Lấy tin nhắn theo cuộc trò chuyện với phân trang"""
        query = self.db.query(Message).filter(Message.conversation_id == conversation_id)
        
        total = query.count()
        
        messages = query.order_by(asc(Message.created_at))\
                       .offset((page - 1) * limit)\
                       .limit(limit)\
                       .all()
        
        return messages, total

    def get_message_by_id(self, message_id: str) -> Optional[Message]:
        """Lấy tin nhắn theo ID"""
        return self.db.query(Message).filter(Message.id == message_id).first()

    def delete_message(self, message_id: str) -> bool:
        """Xóa tin nhắn"""
        message = self.get_message_by_id(message_id)
        if not message:
            return False
        
        self.db.delete(message)
        self.db.commit()
        return True
