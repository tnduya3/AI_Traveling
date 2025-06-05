from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class ConversationCreate(BaseModel):
    user_id: str = Field(..., description="ID của user")
    title: str = Field(..., min_length=1, max_length=255, description="Tiêu đề cuộc trò chuyện")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata bổ sung")

class ConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Tiêu đề cuộc trò chuyện")
    is_archived: Optional[bool] = Field(None, description="Trạng thái lưu trữ")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata bổ sung")

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    is_archived: bool
    metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    conversation_id: str = Field(..., description="ID của cuộc trò chuyện")
    content: str = Field(..., min_length=1, description="Nội dung tin nhắn")
    role: str = Field(..., regex="^(user|assistant)$", description="Vai trò: user hoặc assistant")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata bổ sung")
    token_count: Optional[int] = Field(0, ge=0, description="Số lượng token")

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    content: str
    role: str
    created_at: datetime
    metadata: Optional[Dict[str, Any]]
    token_count: int

    class Config:
        from_attributes = True

class ConversationWithMessages(ConversationResponse):
    messages: List[MessageResponse] = []

class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]
    total: int
    page: int
    limit: int
    has_next: bool
    has_prev: bool
