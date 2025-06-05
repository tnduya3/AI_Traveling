from sqlalchemy.orm import Session
from models.trip_member import TripMember
from schemas.trip_member_schema import TripMemberCreate
from repositories import user_repo
from repositories import trip_repo
from fastapi import HTTPException

# Get all trip_memnbers
def get_trip_members(db: Session):
    return db.query(TripMember)

# Get a trip_member by
def get_trip_member_by(db: Session, select: str, lookup: str):
    if select == "idUser":
        return db.query(TripMember).filter(TripMember.idUser == lookup).all()
    elif select == "idTrip":
        return db.query(TripMember).filter(TripMember.idTrip == lookup).all()
    else:
        raise HTTPException(400, "Bad Request")
    
# Get a trip_member by user and trip
def get_trip_member_by_user_trip(db: Session, idUser: str, idTrip: str):
    return db.query(TripMember).filter(TripMember.idUser == idUser, TripMember.idTrip == idTrip).first()

# Post a new trip_member
def create_trip_member(db: Session, trip_member: TripMemberCreate):
    # Check if the user exists
    if user_repo.get_user_by(db, "idUser", trip_member.idUser) is None:
        raise HTTPException(404, "User not found")
    # Check if the trip exists
    if trip_repo.get_trip_by_id(db, trip_member.idTrip) is None:
        raise HTTPException(404, "Trip not found")
    # Check if the trip_member already exists
    if get_trip_member_by_user_trip(db, trip_member.idUser, trip_member.idTrip):
        raise HTTPException(422, "Trip member already exists")
    
    db_trip_member = TripMember(idUser=trip_member.idUser, idTrip=trip_member.idTrip)
    db.add(db_trip_member)
    db.commit()
    db.refresh(db_trip_member)
    return db_trip_member

# Delete a trip_member
def delete_trip_member(db: Session, idUser: str, idTrip: str):
    # Check if the user exists
    if user_repo.get_user_by(db, "idUser", idUser) is None:
        raise HTTPException(404, "User not found")
    # Check if the trip exists
    if trip_repo.get_trip_by_id(db, idTrip) is None:
        raise HTTPException(404, "Trip not found")
    db_trip_member = get_trip_member_by_user_trip(db, idUser, idTrip)
    if not db_trip_member:
        raise HTTPException(404, "Trip member not found")
    
    db.delete(db_trip_member)
    db.commit()
    return db_trip_member