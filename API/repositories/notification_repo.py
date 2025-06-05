from sqlalchemy.orm import Session
from models.notification import Notification
from schemas.notification_schema import NotificationUpdate, NotificationCreate
from repositories import user_repo
import uuid
from fastapi import HTTPException

# Get all notifications
def get_notifications(db: Session, skip: int, limit: int):
    return db.query(Notification).order_by(Notification.idNotf).offset(skip).limit(limit).all()

# Get notification by id
def get_notification_by_id(db: Session, idNotf: str):
    return db.query(Notification).filter(Notification.idNotf == idNotf).first()
    
# Get notifications by User
def get_notification_by_user(db: Session, idUser: str, skip: int, limit: int):
    if user_repo.get_user_by(db, "idUser", idUser) is None:
        raise HTTPException(404, "User not found")
    return db.query(Notification).filter(Notification.idUser == idUser).order_by(Notification.idNotf).offset(skip).limit(limit).all()

def get_unread_notifications(db: Session, user_id: str, skip: int, limit: int):
    if user_repo.get_user_by(db, "idUser", user_id) is None:
        raise HTTPException(404, "User not found")
    return db.query(Notification).filter(
        Notification.idUser == user_id,
        Notification.isRead == False).order_by(Notification.idNotf).offset(skip).limit(limit).all()
    
# Post a new notification
def create_notification(db: Session, notification: NotificationCreate):
    user = user_repo.get_user_by(db, "idUser", notification.idUser)
    if not user:
        raise HTTPException(404, "User not found")
    
    idNotify = ""
    while not idNotify or get_notification_by_id(db, idNotify):
        idNotify = f"NTF{str(uuid.uuid4())[:3]}"

    db_notification = Notification(idNotf = idNotify, idUser = notification.idUser, content = notification.content, isRead = False)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    return db_notification

# Update a notification
def update_notification(db: Session, idNotify: str, notification: NotificationUpdate):
    db_notification = get_notification_by_id(db, idNotify)
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    for key, value in notification.model_dump(exclude_unset=True).items():
        setattr(db_notification, key, value)
    
    db.commit()
    db.refresh(db_notification)
    return db_notification

# Mark all notifications as read by user
def mark_all_notifications_as_read(db: Session, idUser: str):
    db_notifications = get_notification_by_user(db=db, idUser=idUser)
    if db_notifications == []:
        raise HTTPException(404, "Notification not found")

    for db_notification in db_notifications:
        db_notification.isRead = True
    
    db.commit()
    
    for db_notification in db_notifications:
        db.refresh(db_notification)
    
    return db_notifications

# Delete a notification
def delete_notification(db: Session, idNotify: str):
    db_notification = get_notification_by_id(db, idNotify)

    if not db_notification:
        raise HTTPException(404, "Notification not found")
    
    db.delete(db_notification)
    db.commit()
    return db_notification

# Delete all notifications by user
def delete_notifications_by_user(db: Session, idUser: str):
    db_notifications = get_notification_by_user(db=db, idUser=idUser)
    if db_notifications == []:
        raise HTTPException(404, "Notification not found")
    
    for db_notification in db_notifications:
        db.delete(db_notification)

    db.commit()
    return db_notifications