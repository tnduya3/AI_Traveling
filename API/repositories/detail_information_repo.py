from sqlalchemy.orm import Session 
from models.detail_information import DetailInformation
from schemas.detail_information_schema import DetailCreate, DetailUpdate
import uuid
from repositories import place_repo, trip_repo
from fastapi import HTTPException
from datetime import datetime, timedelta

def get_details(db: Session, skip: int, limit: int):
    return db.query(DetailInformation).order_by(DetailInformation.idDetail).offset(skip).limit(limit).all()

# Get detail information by id
def get_detail_information_by_id(db: Session, id: str):
    return db.query(DetailInformation).filter(DetailInformation.idDetail == id).first()

def get_detail_by(db: Session, select: str, lookup: str, skip: int, limit: int):
    if select == "idPlace":
        return db.query(DetailInformation).filter(DetailInformation.idPlace == lookup).order_by(DetailInformation.idDetail).offset(skip).limit(limit).all()
    elif select == "idTrip":
        return db.query(DetailInformation).filter(DetailInformation.idTrip == lookup).order_by(DetailInformation.idDetail).offset(skip).limit(limit).all()
    elif select == "startTime":
        time = datetime.strptime(lookup, "%d/%m/%Y %H:%M:%S")
        endTime = time + timedelta(milliseconds=999)
        return db.query(DetailInformation).filter(
            DetailInformation.startTime >= time,
            DetailInformation.startTime <= endTime).order_by(DetailInformation.idDetail).offset(skip).limit(limit).all()
    elif select == "endTime":
        time = datetime.strptime(lookup, "%d/%m/%Y %H:%M:%S")
        endTime = time + timedelta(milliseconds=999)
        return db.query(DetailInformation).filter(
            DetailInformation.endTime >= time,
            DetailInformation.endTime <= endTime).order_by(DetailInformation.idDetail).offset(skip).limit(limit).all()
    else:
        raise HTTPException(400, "Bad Request")

# Post detail information
def post_detail_information(db: Session, detail: DetailCreate):
    if not place_repo.get_place_by_id(db, detail.idPlace):
        raise HTTPException(404, "Place not found")
    
    if not trip_repo.get_trip_by_id(db, detail.idTrip):
        raise HTTPException(404, "Trip not found")
    
    idDetail = ""
    while not idDetail or get_detail_information_by_id(db, idDetail):
        idDetail = f"DI{str(uuid.uuid4())[:4]}"
    
    new_detail = DetailInformation(
        idDetail = idDetail,
        idPlace = detail.idPlace,
        idTrip = detail.idTrip,
        startTime = detail.startTime,
        endTime = detail.endTime,
        note = detail.note
    )
    
    db.add(new_detail)
    db.commit()
    db.refresh(new_detail)
    return new_detail

# Update detail information
def update_detail_information(db: Session, id: str, detail: DetailUpdate):
    if not place_repo.get_place_by_id(db, detail.idPlace):
        raise HTTPException(404, "Place not found")
    
    if not trip_repo.get_trip_by_id(db, detail.idTrip):
        raise HTTPException(404, "Trip not found")
    
    db_detail = get_detail_information_by_id(db, id)
    if not db_detail:
        raise HTTPException(404, "Detail information not found")
     
    for key, value in detail.model_dump(exclude_unset=True).items():
        setattr(db_detail, key, value)
    
    db.commit()
    db.refresh(db_detail)
    return db_detail

# Delete detail information
def delete_detail_information(db: Session, id: str):
    # Check if IDDetail exists
    db_detail = get_detail_information_by_id(db, id)
    if not db_detail:
        raise HTTPException(404, "Detail information not found")
    
    db.delete(db_detail)
    db.commit()
    return db_detail
