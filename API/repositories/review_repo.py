from sqlalchemy.orm import Session
from models.review import Review
from schemas.review_schema import ReviewCreate
from fastapi import HTTPException
from repositories import user_repo
from repositories import trip_repo
import uuid

def get_reviews(db: Session, skip: int, limit: int):
    return db.query(Review).order_by(Review.idReview).offset(skip).limit(limit).all()

#lấy top reviews (lọc bởi rating)
def get_best_reviews(db: Session):
    return db.query(Review).order_by(Review.rating.desc()).limit(5).all()

#Get a review by id
def get_review_by_id(db: Session, idReview: str):
    return db.query(Review).filter(Review.idReview == idReview).first()

#Get a review
def get_review_by(db: Session, select: str, lookup: str, skip: int, limit: int):
    if select == "idUser":
        return db.query(Review).filter(Review.idUser == lookup).order_by(Review.idReview).offset(skip).limit(limit).all()
    elif select == "idTrip":
        return db.query(Review).filter(Review.idTrip == lookup).order_by(Review.idReview).offset(skip).limit(limit).all()
    else:
        raise HTTPException(400, "Bad Request")

#tạo mới
def create_review(db: Session, review: ReviewCreate):
    if user_repo.get_user_by(db, "idUser", review.idUser) is None:
        raise HTTPException(404, "User not found")
    
    if trip_repo.get_trip_by_id(db, review.idTrip) is None:
        raise HTTPException(404, "Trip not found")
    
    idReview = ""
    while not idReview or get_review_by_id(db, idReview):
        idReview =  f"RV{str(uuid.uuid4())[:4]}"

    db_review = Review(idReview = idReview, idTrip = review.idTrip, idUser = review.idUser, comment = review.comment, rating = review.rating)
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

#xóa
def delete_review(db: Session, review_id: str):
    review = get_review_by_id(db, review_id)
    if not review:
        raise HTTPException(404, "Review not found")
    
    db.delete(review)
    db.commit()
    return review
