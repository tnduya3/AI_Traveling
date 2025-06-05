from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import trip_schema, user_schema, place_schema
from repositories import trip_repo
from database import get_db
from controllers.auth_ctrl import get_current_user

router = APIRouter()

# Post a new trip
@router.post("/trips/", response_model=trip_schema.TripResponse)
def create_trip(trip: trip_schema.TripCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return trip_repo.create_trip(db=db, trip=trip)

# Get all trips
@router.get("/trips/", response_model=list[trip_schema.TripResponse])
def get_trips(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return trip_repo.get_trips(db)

# Get a trip by id
@router.get("/trips", response_model=trip_schema.TripResponse)
def get_trip_by_id(idTrip: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    trip = trip_repo.get_trip_by_id(db=db, idTrip=idTrip)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    return trip

# Get a trip by
@router.get("/trips/{select}", response_model=list[trip_schema.TripResponse])
def get_trip_by(select: str, lookup: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    trip = trip_repo.get_trip_by(db=db, select=select, lookup=lookup)
    if trip == []:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    return trip

# Get trips by date and keyword
@router.get("/trips/date-key", response_model=list[trip_schema.TripResponse])
def get_trips_date_key(start_date: str = None, end_date: str = None, keyword: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    trip = trip_repo.get_trips(db, start_date, end_date, keyword)
    if trip == []:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    return trip

# Get members by trip
@router.get("/trips/{idTrip}/members/", response_model=list[user_schema.UserResponse])
def get_members_by_trip(idTrip: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    members = trip_repo.get_members_of_trip(db, idTrip)
    if members == []:
        raise HTTPException(status_code=404, detail="Trip hasn't any member")
    
    return members

@router.get("/trips/{idTrip}/reviewed/", response_model=list[user_schema.UserResponse])
def get_users_reviewed_trip(idTrip: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    users = trip_repo.get_users_reviewed_trip(db, idTrip)
    if users == []:
        raise HTTPException(status_code=404, detail="Trip hasn't any review")
    
    return users

@router.get("/trips/{idTrip}/places/", response_model=list[place_schema.PlaceResponse])
def get_places_of_trip(idTrip: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    places = trip_repo.get_places_of_trip(db, idTrip)
    if places == []:
        raise HTTPException(status_code=404, detail="Trip hasn't any place")
    
    return places

# Update a trip
@router.put("/trips/{idTrip}", response_model=trip_schema.TripResponse)
def update_trip(idTrip: str, trip: trip_schema.TripUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return trip_repo.update_trip(db=db, trip_id=idTrip, trip_update=trip)

# Delete a trip
@router.delete("/trips/{idTrip}", response_model=trip_schema.TripResponse)
def delete_trip(idTrip: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return trip_repo.delete_trip(db=db, trip_id=idTrip)