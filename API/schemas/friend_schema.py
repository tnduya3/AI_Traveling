from pydantic import BaseModel

class FriendBase(BaseModel):
    idSelf: str
    idFriend: str

class FriendResponse(FriendBase):
    isAccept: bool
    class Config:
        from_attributes = True
        
class FriendCreate(FriendBase):
    pass

class FriendUpdate(FriendBase):
    isAccept: bool