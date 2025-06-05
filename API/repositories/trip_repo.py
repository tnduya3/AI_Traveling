from sqlalchemy.orm import Session
from models.trip import Trip
from schemas.trip_schema import TripCreate, TripUpdate
from datetime import datetime, timedelta
from fastapi import HTTPException
import uuid

#tìm trong start_date -> end_date và theo keyword
def get_trips(db: Session, start_date: datetime = None, end_date: datetime = None, keyword: str = None):
    query = db.query(Trip)
    if start_date and end_date:
        query = query.filter(Trip.startDate >= start_date, Trip.endDate <= end_date).all()
    if keyword:
        query = query.filter(Trip.name.ilike(f"%{keyword}%")).all()
    return query.all()

# Get a trip by id
def get_trip_by_id(db: Session, idTrip: str):
    return db.query(Trip).filter(Trip.idTrip == idTrip).first()

# Get a trip by
def get_trip_by(db: Session, select: str, lookup: str):
    if select == "startDate":
        time = datetime.strptime(lookup, "%d/%m/%Y %H:%M:%S")
        endTime = time + timedelta(milliseconds=999)
        return db.query(Trip).filter(
            Trip.startDate >= time,
            Trip.startDate <= endTime).all()
    elif select == "endDate":
        time = datetime.strptime(lookup, "%d/%m/%Y %H:%M:%S")
        endTime = time + timedelta(milliseconds=999)
        return db.query(Trip).filter(
            Trip.endDate >= time,
            Trip.endDate <= endTime).all()
    else:
        raise HTTPException(status_code=400, detail="Bad Request")
    
def get_members_of_trip(db: Session, idTrip: str):
    trip = get_trip_by_id(db, idTrip)
    if not trip:
        raise HTTPException(404, "Trip not found")
    
    return trip.members

def get_users_reviewed_trip(db: Session, idTrip: str):
    trip = get_trip_by_id(db, idTrip)
    if not trip:
        raise HTTPException(404, "Trip not found")
    
    return trip.reviewed_by

def get_places_of_trip(db: Session, idTrip: str):
    trip = get_trip_by_id(db, idTrip)
    if not trip:
        raise HTTPException(404, "Trip not found")
    
    return trip.place_contain

#tạo mới trip
def create_trip(db: Session, trip: TripCreate):
    idTrip = ""
    while not idTrip or get_trip_by_id(db, idTrip):
        idTrip =  f"TR{str(uuid.uuid4())[:4]}"

    db_trip = Trip(idTrip = idTrip, name = trip.name, startDate = trip.startDate, endDate = trip.endDate)
    
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

#update
def update_trip(db: Session, trip_id: str, trip_update: TripUpdate):
    trip = get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    for key, value in trip_update.model_dump(exclude_unset=True).items():
        setattr(trip, key, value)
    
    db.commit()
    db.refresh(trip)
    return trip

#del
def delete_trip(db: Session, trip_id: str):
    trip = get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db.delete(trip)
    db.commit()
    return trip