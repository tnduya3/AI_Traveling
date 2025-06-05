from sqlalchemy.orm import Session
from models.booking import Booking
from models.user import User
from schemas.booking_schema import BookingCreate, BookingUpdate
from datetime import datetime, timedelta
from fastapi import HTTPException
from repositories import place_repo
import uuid

def get_bookings(db: Session):
    return db.query(Booking).all()

def get_booking_by_id(db: Session, idBooking: str):
    return db.query(Booking).filter(Booking.idBooking == idBooking).first()

def get_booking_by(db: Session, select: str, lookup: str):
    if select == "idPlace":
        return db.query(Booking).filter(Booking.idPlace == lookup).all()
    elif select == "date":
        time = datetime.strptime(lookup, "%d/%m/%Y %H:%M:%S")
        endTime = time + timedelta(milliseconds=999)
        return db.query(Booking).filter(
            Booking.date >= time,
            Booking.date <= endTime).all()
    elif select == "status":
        return db.query(Booking).filter(Booking.status == lookup).all()
    else:
        raise HTTPException(400, "Bad Request")
    
def get_owners_of_booking(db: Session, idBooking: str):
    booking = get_booking_by_id(db, idBooking)
    if not booking:
        raise HTTPException(404, "Booking not found")
    
    return booking.owner_booking
        
def get_place_of_booking(db: Session, idBooking: str):
    booking = get_booking_by_id(db, idBooking)
    if not booking:
        raise HTTPException(404, "Booking not found")
    
    return booking.place

def create_booking(db: Session, booking: BookingCreate):
    # Kiểm tra idPlace
    if not place_repo.get_place_by_id(db, booking.idPlace):
        raise HTTPException(status_code=404, detail="Place not found")
    
    id_booking = ""
    while not id_booking or get_booking_by_id(db, id_booking):
        id_booking = f"BK{str(uuid.uuid4())[:4]}"
        
    # Tạo đối tượng Booking từ dữ liệu đầu vào
    db_booking = Booking(
        idBooking=id_booking,
        idPlace=booking.idPlace,
        date=booking.date,
        status=booking.status
    )
    
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def update_booking(db: Session, id_booking: str, booking_update: BookingUpdate):
    # Kiểm tra idPlace
    if not place_repo.get_place_by_id(db, booking_update.idPlace):
        raise HTTPException(status_code=404, detail="Place not found")

    # Cập nhật booking nếu kiểm tra thành công    
    db_booking = db.query(Booking).filter(
        Booking.idBooking == id_booking
    ).first()
    
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Cập nhật các trường
    for key, value in booking_update.model_dump(exclude_unset=True).items():
        setattr(db_booking, key, value)
        
    db.commit()
    db.refresh(db_booking)
    return db_booking

def delete_booking(db: Session, id_booking: str):
    # Xóa booking nếu kiểm tra thành công
    db_booking = db.query(Booking).filter(
        Booking.idBooking == id_booking
    ).first()
    
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(db_booking)
    db.commit()
    return db_booking


def get_bookings_by_user(db: Session, user_id: str):
    """
    Lấy danh sách booking của một user cụ thể
    """
    return db.query(Booking).join(Booking.owner_booking).filter(User.idUser == user_id).all()