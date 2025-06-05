from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import user_schema, trip_schema, booking_schema
from repositories import user_repo
from database import get_db
from controllers.auth_ctrl import get_current_user

router = APIRouter()

# Get all users
@router.get("/users/", response_model=list[user_schema.UserResponse])
def get_users(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return user_repo.get_users(db)

# Get a user by
@router.get("/users/{select}", response_model=user_schema.UserResponse)
def get_user_by(select: str, lookup: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    user = user_repo.get_user_by(db=db, select=select, lookup=lookup)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.get("/users/{idUser}/trips", response_model=list[trip_schema.TripResponse])
def get_trips_of_user(idUser: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    trips = user_repo.get_trips_of_user(db, idUser)
    if trips == []:
        raise HTTPException(status_code=404, detail="User hasn't any trip")
    
    return trips

@router.get("/users/{idUser}/bookings", response_model=list[booking_schema.BookingResponse])
def get_bookings_of_user(idUser: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    bookings = user_repo.get_bookings_of_user(db, idUser)
    if bookings == []:
        raise HTTPException(status_code=404, detail="User hasn't ever booked")
    
    return bookings

@router.get("/users/{idUser}/friend_requests_of", response_model=list[user_schema.UserResponse])
def get_friend_requests_of_user(idUser: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    friend_requests = user_repo.get_friend_requests_of_user(db, idUser)
    if friend_requests == []:
        raise HTTPException(status_code=404, detail="User hasn't send any friend request")
    
    return friend_requests

@router.get("/users/{idUser}/friend_requests_to", response_model=list[user_schema.UserResponse])
def get_friend_requests_to_user(idUser: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    friend_requests = user_repo.get_friend_requests_to_user(db, idUser)
    if friend_requests == []:
        raise HTTPException(status_code=404, detail="User hasn't received any friend request")
    
    return friend_requests

@router.get("/users/{idUser}/reviewed_trips", response_model=list[trip_schema.TripResponse])
def get_reviewed_trips_of_user(idUser: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    reviewed_trips = user_repo.get_reviewed_trips_of_user(db, idUser)
    if reviewed_trips == []:
        raise HTTPException(status_code=404, detail="User hasn't reviewed any trip")
    
    return reviewed_trips

# Post a new user
@router.post("/users/", response_model=user_schema.UserResponse)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return user_repo.create_user(db=db, user=user)

# Update a user
@router.put("/users/{idUser}", response_model=user_schema.UserResponse)
def update_user(idUser: str, user: user_schema.UserUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return user_repo.update_user(db=db, idUser=idUser, user=user)

# Delete a user
@router.delete("/users/{idUser}", response_model=user_schema.UserResponse)
def delete_user(idUser: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return user_repo.delete_user(db=db, idUser=idUser)