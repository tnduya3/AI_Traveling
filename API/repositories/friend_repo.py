from sqlalchemy.orm import Session
from models.friend import Friend
from schemas.friend_schema import FriendCreate, FriendUpdate
from fastapi import HTTPException
from repositories import user_repo
from sqlalchemy import or_

def get_friends(db: Session):
    return db.query(Friend).all()

def get_friends_by_user(db: Session, user_id: str):
    return db.query(Friend).filter(or_(
        (Friend.idSelf == user_id) & (Friend.isAccept == True),
        (Friend.idFriend == user_id) & (Friend.isAccept == True)
    )).all()

def create_friend(db: Session, friend: FriendCreate):
    # Kiểm tra idSelf
    if not user_repo.get_user_by(db, "idUser", friend.idSelf):
        raise HTTPException(status_code=404, detail="User (idSelf) not found")

    # Kiểm tra idFriend
    if not user_repo.get_user_by(db, "idUser", friend.idFriend):
        raise HTTPException(status_code=404, detail="User (idFriend) not found")

    # Kiểm tra không cho phép kết bạn với chính mình
    if friend.idSelf == friend.idFriend:
        raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")
    
    if db.query(Friend).filter(or_(
       (Friend.idSelf == friend.idSelf) & (Friend.idFriend == friend.idFriend),
       (Friend.idFriend == friend.idSelf) & (Friend.idSelf == friend.idFriend)
    )).first():
        raise HTTPException(422, "Relationship already exists")

    # Tạo đối tượng Friend từ dữ liệu đầu vào
    db_friend = Friend(idSelf=friend.idSelf, idFriend=friend.idFriend, isAccept=False)
    db.add(db_friend)
    db.commit()
    db.refresh(db_friend)
    return db_friend

def update_friend(db: Session, friend: FriendUpdate):
    # Kiểm tra idSelf
    if not user_repo.get_user_by(db, "idUser", friend.idSelf):
        raise HTTPException(status_code=404, detail="User (idSelf) not found")

    # Kiểm tra idFriend
    if not user_repo.get_user_by(db, "idUser", friend.idFriend):
        raise HTTPException(status_code=404, detail="User (idFriend) not found")

    # Kiểm tra không cho phép kết bạn với chính mình
    if friend.idSelf == friend.idFriend:
        raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")
    
    db_friend = db.query(Friend).filter(or_(
       (Friend.idSelf == friend.idSelf) & (Friend.idFriend == friend.idFriend),
       (Friend.idFriend == friend.idSelf) & (Friend.idSelf == friend.idFriend)
    )).first()
    if db_friend is None:
        raise HTTPException(404, "Relationship not found")
    
    for key, value in friend.model_dump(exclude_unset=True).items():
        setattr(db_friend, key, value)
            
    db.commit()
    db.refresh(db_friend)
    return db_friend

def delete_friend(db: Session, id_self: str, id_friend: str):
    # Kiểm tra idSelf
    if not user_repo.get_user_by(db, "idUser", id_self):
        raise HTTPException(status_code=404, detail="User (idSelf) not found")

    # Kiểm tra idFriend
    if not user_repo.get_user_by(db, "idUser", id_friend):
        raise HTTPException(status_code=404, detail="User (idFriend) not found")
    
    db_friend = db.query(Friend).filter(or_(
       (Friend.idSelf == id_self) & (Friend.idFriend == id_friend),
       (Friend.idFriend == id_self) & (Friend.idSelf == id_friend)
    )).first()
    if db_friend is None:
        raise HTTPException(404, "Relationship not found")
    
    db.delete(db_friend)
    db.commit()
    return db_friend