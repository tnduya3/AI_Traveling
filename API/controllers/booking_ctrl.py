from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas.booking_schema import BookingCreate, BookingUpdate, BookingResponse
from schemas.user_schema import UserResponse
from schemas.place_schema import PlaceResponse
from repositories import booking_repo
from controllers.auth_ctrl import get_current_user

router = APIRouter()

@router.get("/bookings/", response_model=list[BookingResponse])
def get_bookings(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return booking_repo.get_bookings_by_user(db, current_user.idUser)

@router.get("/bookings", response_model=BookingResponse)
def get_booking_by_id(idBooking: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    booking = booking_repo.get_booking_by_id(db, idBooking)
    if booking is None:
        raise HTTPException(404, "Booking not found")
    
    return booking

@router.get("/bookings/{select}", response_model=list[BookingResponse])
def get_booking_by(select: str, lookup: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    booking = booking_repo.get_booking_by(db, select, lookup, current_user)
    if booking == []:
        raise HTTPException(404, "Booking not found")
    
    return booking

@router.get("/bookings/{idBooking}/users/", response_model=list[UserResponse])
def get_owners_of_booking(idBooking: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    users = booking_repo.get_owners_of_booking(db, idBooking)
    if users == []:
        raise HTTPException(404, "Booking hasn't any owner")
    
    return users

@router.get("/bookings/{idBooking}/places/", response_model=PlaceResponse)
def get_place_by_booking(idBooking: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    place = booking_repo.get_place_of_booking(db, idBooking)
    if place is None:
        raise HTTPException(404, "Booking hasn't any place")
    
    return place


@router.post("/bookings/", response_model=BookingResponse)
def create_new_booking(booking: BookingCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Tạo booking nếu kiểm tra thành công
    return booking_repo.create_booking(db, booking, current_user)

@router.put("/bookings/", response_model=BookingResponse)
def update_booking(idBooking: str, booking: BookingUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return booking_repo.update_booking(db, idBooking, booking)

@router.delete("/bookings/", response_model=BookingResponse)
def delete_booking(id_booking: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return booking_repo.delete_booking(db, id_booking)