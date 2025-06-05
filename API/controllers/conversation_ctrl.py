from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from API.database import get_db
from API.repositories.conversation_repo import ConversationRepository, MessageRepository
from API.schemas.conversation_schema import (
    ConversationCreate, ConversationUpdate, ConversationResponse,
    ConversationWithMessages, ConversationListResponse,
    MessageCreate, MessageResponse
)
import math

router = APIRouter(prefix="/conversations", tags=["Conversations"])

# Conversation endpoints
@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db)
):
    """Tạo cuộc trò chuyện mới"""
    try:
        repo = ConversationRepository(db)
        conversation = repo.create_conversation(conversation_data)
        return ConversationResponse.from_orm(conversation)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tạo cuộc trò chuyện: {str(e)}"
        )

@router.get("/user/{user_id}", response_model=ConversationListResponse)
async def get_user_conversations(
    user_id: str,
    page: int = Query(1, ge=1, description="Số trang"),
    limit: int = Query(20, ge=1, le=100, description="Số lượng mỗi trang"),
    include_archived: bool = Query(False, description="Bao gồm cuộc trò chuyện đã lưu trữ"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tiêu đề"),
    db: Session = Depends(get_db)
):
    """Lấy danh sách cuộc trò chuyện của user"""
    try:
        repo = ConversationRepository(db)
        conversations, total = repo.get_conversations_by_user(
            user_id=user_id,
            page=page,
            limit=limit,
            include_archived=include_archived,
            search=search
        )
        
        total_pages = math.ceil(total / limit)
        
        return ConversationListResponse(
            conversations=[ConversationResponse.from_orm(conv) for conv in conversations],
            total=total,
            page=page,
            limit=limit,
            has_next=page < total_pages,
            has_prev=page > 1
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy danh sách cuộc trò chuyện: {str(e)}"
        )

@router.get("/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation_detail(
    conversation_id: str,
    include_messages: bool = Query(True, description="Bao gồm tin nhắn"),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết cuộc trò chuyện"""
    try:
        repo = ConversationRepository(db)
        conversation = repo.get_conversation_by_id(conversation_id, include_messages)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy cuộc trò chuyện"
            )
        
        result = ConversationWithMessages.from_orm(conversation)
        if include_messages and conversation.messages:
            result.messages = [MessageResponse.from_orm(msg) for msg in conversation.messages]
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy chi tiết cuộc trò chuyện: {str(e)}"
        )

@router.put("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    update_data: ConversationUpdate,
    db: Session = Depends(get_db)
):
    """Cập nhật cuộc trò chuyện"""
    try:
        repo = ConversationRepository(db)
        conversation = repo.update_conversation(conversation_id, update_data)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy cuộc trò chuyện"
            )
        
        return ConversationResponse.from_orm(conversation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật cuộc trò chuyện: {str(e)}"
        )

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Xóa cuộc trò chuyện"""
    try:
        repo = ConversationRepository(db)
        success = repo.delete_conversation(conversation_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy cuộc trò chuyện"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xóa cuộc trò chuyện: {str(e)}"
        )

@router.patch("/{conversation_id}/archive", response_model=ConversationResponse)
async def archive_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Lưu trữ cuộc trò chuyện"""
    try:
        repo = ConversationRepository(db)
        conversation = repo.archive_conversation(conversation_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy cuộc trò chuyện"
            )
        
        return ConversationResponse.from_orm(conversation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lưu trữ cuộc trò chuyện: {str(e)}"
        )
