from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from API.database import get_db
from API.repositories.conversation_repo import MessageRepository, ConversationRepository
from API.schemas.conversation_schema import MessageCreate, MessageResponse
import math

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db)
):
    """Tạo tin nhắn mới"""
    try:
        # Kiểm tra conversation có tồn tại không
        conv_repo = ConversationRepository(db)
        conversation = conv_repo.get_conversation_by_id(message_data.conversation_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy cuộc trò chuyện"
            )
        
        # Tạo message
        msg_repo = MessageRepository(db)
        message = msg_repo.create_message(message_data)
        
        return MessageResponse.from_orm(message)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tạo tin nhắn: {str(e)}"
        )

@router.get("/conversation/{conversation_id}")
async def get_conversation_messages(
    conversation_id: str,
    page: int = Query(1, ge=1, description="Số trang"),
    limit: int = Query(50, ge=1, le=100, description="Số lượng mỗi trang"),
    db: Session = Depends(get_db)
):
    """Lấy tin nhắn theo cuộc trò chuyện"""
    try:
        # Kiểm tra conversation có tồn tại không
        conv_repo = ConversationRepository(db)
        conversation = conv_repo.get_conversation_by_id(conversation_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy cuộc trò chuyện"
            )
        
        # Lấy messages
        msg_repo = MessageRepository(db)
        messages, total = msg_repo.get_messages_by_conversation(
            conversation_id=conversation_id,
            page=page,
            limit=limit
        )
        
        total_pages = math.ceil(total / limit)
        
        return {
            "messages": [MessageResponse.from_orm(msg) for msg in messages],
            "total": total,
            "page": page,
            "limit": limit,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy tin nhắn: {str(e)}"
        )

@router.get("/{message_id}", response_model=MessageResponse)
async def get_message_detail(
    message_id: str,
    db: Session = Depends(get_db)
):
    """Lấy chi tiết tin nhắn"""
    try:
        repo = MessageRepository(db)
        message = repo.get_message_by_id(message_id)
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy tin nhắn"
            )
        
        return MessageResponse.from_orm(message)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy chi tiết tin nhắn: {str(e)}"
        )

@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: str,
    db: Session = Depends(get_db)
):
    """Xóa tin nhắn"""
    try:
        repo = MessageRepository(db)
        success = repo.delete_message(message_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy tin nhắn"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xóa tin nhắn: {str(e)}"
        )

# Endpoint đặc biệt để tạo cả conversation và message đầu tiên
@router.post("/start-conversation", response_model=dict)
async def start_conversation(
    user_id: str,
    title: str,
    first_message: str,
    role: str = "user",
    db: Session = Depends(get_db)
):
    """Bắt đầu cuộc trò chuyện mới với tin nhắn đầu tiên"""
    try:
        # Tạo conversation
        conv_repo = ConversationRepository(db)
        from API.schemas.conversation_schema import ConversationCreate
        conversation_data = ConversationCreate(
            user_id=user_id,
            title=title
        )
        conversation = conv_repo.create_conversation(conversation_data)
        
        # Tạo message đầu tiên
        msg_repo = MessageRepository(db)
        message_data = MessageCreate(
            conversation_id=conversation.id,
            content=first_message,
            role=role
        )
        message = msg_repo.create_message(message_data)
        
        return {
            "conversation": ConversationResponse.from_orm(conversation),
            "first_message": MessageResponse.from_orm(message)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi bắt đầu cuộc trò chuyện: {str(e)}"
        )
