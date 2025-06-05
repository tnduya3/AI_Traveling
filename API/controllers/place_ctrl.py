from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import place_schema, booking_schema
from controllers.auth_ctrl import get_current_user
from repositories import place_repo

router = APIRouter()

@router.get("/places/all", response_model=list[place_schema.PlaceResponse])
def get_places(db: Session = Depends(get_db), current_user = Depends(get_current_user), skip: int = 0, limit: int = 100):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return place_repo.get_places(db, skip, limit)

@router.get("/places", response_model=place_schema.PlaceResponse)
def get_place_by_id(idPlace: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    place = place_repo.get_place_by_id(db, idPlace)
    if place is None:
        raise HTTPException(404, "Place not found")
    
    return place

@router.get("/places/{idPlace}/bookings/", response_model=list[booking_schema.BookingResponse])
def get_bookings_by_place(idPlace: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    bookings = place_repo.get_bookings_of_place(db, idPlace)
    if bookings == []:
        raise HTTPException(404, "Place hasn't ever booked")
    
    return bookings

@router.get("/places/{select}", response_model=list[place_schema.PlaceResponse])
def get_place_by(select: str, lookup: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    places = place_repo.get_place_by(db, select, lookup)
    if places == []:
        raise HTTPException(status_code=404, detail="Place not found")
    
    return places

@router.get("/places/{idPlace}/trips/", response_model=list[place_schema.PlaceResponse])
def get_trips_by_place(idPlace: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    trips = place_repo.get_trips_contain_place(db, idPlace)
    if trips == []:
        raise HTTPException(status_code=404, detail="Place hasn't ever booked")
    
    return trips


@router.post("/places/", response_model=place_schema.PlaceResponse)
def create_place(place: place_schema.PlaceCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return place_repo.post_place(db, place)

@router.put("/places/{idPlace}", response_model=place_schema.PlaceResponse)
def update_place(idPlace: str, place: place_schema.PlaceUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return place_repo.update_place(db, idPlace, place)

@router.delete("/places/{idPlace}", response_model=place_schema.PlaceResponse)
def delete_place(idPlace: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return place_repo.delete_place(db, idPlace)

@router.get("/search/", response_model=list[place_schema.PlaceResponse])
def search_places(
    query: str,
    place_type: int = None,
    min_rating: int = None,
    db: Session = Depends(get_db)
):
    """Search places with filters"""
    places = place_repo.search_places(
        db,
        query=query,
        place_type=place_type,
        min_rating=min_rating
    )
    return places
