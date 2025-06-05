from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import review_schema
from repositories import review_repo
from database import get_db
from controllers.auth_ctrl import get_current_user

router = APIRouter()

# Get all reviews
@router.get("/reviews/all", response_model=list[review_schema.ReviewResponse])
def get_reviews(db: Session = Depends(get_db), current_user = Depends(get_current_user), skip: int = 0, limit: int = 100):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return review_repo.get_reviews(db, skip, limit)

# Get a review by id
@router.get("/reviews", response_model=review_schema.ReviewResponse)
def get_review_by_id(idReview: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    review = review_repo.get_review_by_id(db=db, idReview=idReview)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return review

# Get a review by
@router.get("/reviews/{select}", response_model=list[review_schema.ReviewResponse])
def get_review_by(select: str, lookup: str, db: Session = Depends(get_db), current_user = Depends(get_current_user), skip: int = 0, limit: int = 100):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    review = review_repo.get_review_by(db, select, lookup, skip, limit)
    if review == []:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return review

# Get top reviews
@router.get("/reviews/top/", response_model=list[review_schema.ReviewResponse])
def get_best_reviews(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return review_repo.get_best_reviews(db=db)

# Post a new review
@router.post("/reviews/", response_model=review_schema.ReviewResponse)
def create_review(review: review_schema.ReviewCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return review_repo.create_review(db=db, review=review)

# Delete a review
@router.delete("/reviews/{idReview}", response_model=review_schema.ReviewResponse)
def delete_review(idReview: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return review_repo.delete_review(db, idReview)
