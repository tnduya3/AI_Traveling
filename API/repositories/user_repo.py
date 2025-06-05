from sqlalchemy.orm import Session
from models.user import User
from schemas.user_schema import UserCreate, UserUpdate
from fastapi import HTTPException
from sqlalchemy import or_
import uuid

# Get all users
def get_users(db: Session):
    return db.query(User)

# Get a user by
def get_user_by(db: Session, select: str, lookup: str):
    if select == "idUser":
        return db.query(User).filter(User.idUser == lookup).first()
    elif select == "username":
        return db.query(User).filter(User.username == lookup).first()
    elif select == "email":
        return db.query(User).filter(User.email == lookup).first()
    elif select == "phone":
        return db.query(User).filter(User.phoneNumber == lookup).first()
    else:
        raise HTTPException(status_code=400, detail="Bad Request")
    
# Get trips of user
def get_trips_of_user(db: Session, idUser: str):
    user = get_user_by(db, "idUser", idUser)
    if not user:
        raise HTTPException(404, "User not found")
    
    return user.trips

# Get bookings of user
def get_bookings_of_user(db: Session, idUser: str):
    user = get_user_by(db, "idUser", idUser)
    if not user:
        raise HTTPException(404, "User not found")
    
    return user.bookings

def get_friend_requests_of_user(db: Session, idUser: str):
    user = get_user_by(db, "idUser", idUser)
    if not user:
        raise HTTPException(404, "User not found")
    
    return user.sent_friends

def get_friend_requests_to_user(db: Session, idUser: str):
    user = get_user_by(db, "idUser", idUser)
    if not user:
        raise HTTPException(404, "User not found")
    
    return user.received_friends

def get_reviewed_trips_of_user(db: Session, idUser: str):
    user = get_user_by(db, "idUser", idUser)
    if not user:
        raise HTTPException(404, "User not found")
    
    return user.reviewed

# Post a new user
def create_user(db: Session, user: UserCreate):
    # Check if the user already exists
    if get_users(db).filter(or_(
            User.username == user.username, User.email == user.email, User.phoneNumber == user.phoneNumber)
        ).first():
        raise HTTPException(status_code=422, detail="User already exists")
    
    # If the user does not exist, create a new user    
    idUser = ""
    while not idUser or get_user_by(db, "idUser", idUser):
        idUser =  f"US{str(uuid.uuid4())[:4]}"
    
    db_user = User(idUser=idUser, name=user.name, username=user.username, password=user.password, gender=user.gender, email=user.email, phoneNumber=user.phoneNumber, avatar=user.avatar, theme=0, language=0)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Update a user
def update_user(db: Session, idUser: str, user: UserUpdate):
    db_user = get_user_by(db, "idUser", idUser)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    afterUsers = [
        get_user_by(db=db, select="username", lookup=user.username),
        get_user_by(db=db, select="email", lookup=user.email),
        get_user_by(db=db, select="phone", lookup=user.phoneNumber)
    ]
    
    for afterUser in afterUsers:
        if afterUser and afterUser.idUser != idUser:
            raise HTTPException(status_code=422, detail="User already exists")
    
    for key, value in user.model_dump(exclude_unset=True).items():
        if value:
            setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

# Delete a user
def delete_user(db: Session, idUser: str):
    db_user = get_user_by(db, "idUser", idUser)
    if not db_user:
       raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return db_user