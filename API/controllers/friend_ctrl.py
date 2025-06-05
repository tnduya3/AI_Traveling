from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import schemas.friend_schema as friend_schema
from repositories import friend_repo
from repositories import user_repo
from controllers.auth_ctrl import get_current_user

router = APIRouter()

@router.get("/friends/", response_model=list[friend_schema.FriendResponse])
def get_all_friends(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return friend_repo.get_friends(db)

@router.get("/friends/{user_id}", response_model=list[friend_schema.FriendResponse])
def get_friends(user_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Kiểm tra user_id
    if not user_repo.get_user_by(db, "idUser", user_id):
        raise HTTPException(status_code=404, detail="User not found")

    # Lấy danh sách bạn bè
    friends = friend_repo.get_friends_by_user(db, user_id)
    if friends == []:
        raise HTTPException(status_code=404, detail="No friends found for this user")
    return friends

@router.post("/friends/", response_model=friend_schema.FriendResponse)
def create_new_friend(friend: friend_schema.FriendCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Tạo quan hệ bạn bè
    return friend_repo.create_friend(db, friend)

@router.put("/friends/", response_model=friend_schema.FriendResponse)
def update_friend(friend: friend_schema.FriendUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Tạo quan hệ bạn bè
    return friend_repo.update_friend(db, friend)

@router.delete("/friends", response_model=friend_schema.FriendResponse)
def delete_friend(id_self: str, id_friend: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Xóa quan hệ bạn bè
    return friend_repo.delete_friend(db, id_self, id_friend)