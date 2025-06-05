from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import detail_information_schema
from repositories import detail_information_repo
from database import get_db
from controllers.auth_ctrl import get_current_user

router = APIRouter()

@router.get("/details/all", response_model=list[detail_information_schema.DetailResponse])
def get_details(db: Session = Depends(get_db), current_user = Depends(get_current_user), skip: int = 0, limit: int = 100):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return detail_information_repo.get_details(db, skip, limit)

@router.get("/details", response_model=detail_information_schema.DetailResponse)
def get_detail_by_id(idDetail: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    detail = detail_information_repo.get_detail_information_by_id(db, idDetail)
    if detail is None:
        raise HTTPException(404, "Detail information not found")
    
    return detail

@router.get("/details/{select}", response_model=list[detail_information_schema.DetailResponse])
def get_detail_by(select: str, lookup: str, db: Session = Depends(get_db), current_user = Depends(get_current_user), skip: int = 0, limit: int = 100):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    details = detail_information_repo.get_detail_by(db, select, lookup, skip, limit)
    if details == []:
        raise HTTPException(404, "Detail information not found")
    
    return details

@router.post("/details/", response_model=detail_information_schema.DetailResponse)
def create_detail(detail: detail_information_schema.DetailCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return detail_information_repo.post_detail_information(db, detail)

@router.put("/details/{idDetail}", response_model=detail_information_schema.DetailResponse)
def update_detail(idDetail: str, detail: detail_information_schema.DetailUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return detail_information_repo.update_detail_information(db, idDetail, detail)

@router.delete("/details/{idDetail}", response_model=detail_information_schema.DetailResponse)
def delete_detail(idDetail: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return detail_information_repo.delete_detail_information(db, idDetail)
