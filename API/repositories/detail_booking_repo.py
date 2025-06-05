from sqlalchemy.orm import Session
from models.detail_booking import DetailBooking
from schemas.detail_booking_schema import DetailBookingCreate
from repositories import user_repo
from repositories import booking_repo
from fastapi import HTTPException

def get_detail_bookings(db: Session):
    return db.query(DetailBooking)

def get_detail_booking_by(db: Session, select: str, lookup: str):
    if select == "idUser":
        return db.query(DetailBooking).filter(DetailBooking.idUser == lookup).all()
    elif select == "idBooking":
        return db.query(DetailBooking).filter(DetailBooking.idBooking == lookup).all()
    else:
        raise HTTPException(400, "Bad Request")
    
def get_detail_booking_by_user_booking(db: Session, idUser: str, idBooking: str):
    return db.query(DetailBooking).filter(DetailBooking.idUser == idUser, DetailBooking.idBooking == idBooking).first()

def create_detail_booking(db: Session, detail_booking: DetailBookingCreate):
    # Check if the user exists
    if user_repo.get_user_by(db, "idUser", detail_booking.idUser) is None:
        raise HTTPException(404, "User not found")
    # Check if the booking exists
    if booking_repo.get_booking_by_id(db, detail_booking.idBooking) is None:
        raise HTTPException(404, "Booking not found")
    # Check if the detail_booking already exists
    if get_detail_booking_by_user_booking(db, detail_booking.idUser, detail_booking.idBooking):
        raise HTTPException(422, "Detail booking already exists")
    
    db_detail_booking = DetailBooking(idUser=detail_booking.idUser, idBooking=detail_booking.idBooking)
    db.add(db_detail_booking)
    db.commit()
    db.refresh(db_detail_booking)
    return db_detail_booking

def delete_detail_booking(db: Session, idUser: str, idBooking: str):
    if user_repo.get_user_by(db, "idUser", idUser) is None:
        raise HTTPException(404, "User not found")
    
    if booking_repo.get_booking_by_id(db, idBooking) is None:
        raise HTTPException(404, "Booking not found")
    db_detail_booking = get_detail_booking_by_user_booking(db, idUser, idBooking)
    if not db_detail_booking:
        raise HTTPException(404, "Detail booking not found")
    
    db.delete(db_detail_booking)
    db.commit()
    return db_detail_booking