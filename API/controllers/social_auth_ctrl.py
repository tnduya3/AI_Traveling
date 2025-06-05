from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
from database import get_db
from models.token import Token
from models.user import User
import auth
import requests
import secrets

router = APIRouter()

class SocialLoginRequest(BaseModel):
    provider: str
    token: str
    email: str = None
    name: str = None

@router.post("/social-login")
async def social_login(request: SocialLoginRequest, db: Session = Depends(get_db)):
    """
    Handle social login from Google or Facebook
    """
    if request.provider not in ["google", "facebook"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported provider"
        )
    
    # Verify token with provider
    user_data = None
    if request.provider == "google":
        user_data = verify_google_token(request.token)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid social token"
        )
    
    # Get email and name from token verification or request
    email = user_data.get("email") or request.email
    name = user_data.get("name") or request.name
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Check if user exists in Token table
    token_user = db.query(Token).filter(Token.username == email).first()
    
    # Check if user exists in User table
    user = db.query(User).filter(User.username == email).first()
    
    # New user - needs registration
    if not token_user:
        # Extract Google profile information
        profile_data = {
            "email": email,
            "name": name,
            "picture": user_data.get("picture"),
            "given_name": user_data.get("given_name"),
            "family_name": user_data.get("family_name"),
            "locale": user_data.get("locale")
        }
        
        # Return profile data for registration
        return {
            "isNewUser": True,
            "message": "User not registered. Please complete registration.",
            "profileData": profile_data
        }
    
    # User exists but may be missing from User table
    if not user:
        return {
            "isNewUser": True,
            "message": "User account incomplete. Please complete registration.",
            "username": email,
            "name": name
        }
    
    # Existing user - generate token and return user info
    token_data = {
        "sub": user.username,
        "user_id": user.idUser,
        "name": user.name
    }
    
    # Generate access token
    access_token = auth.create_access_token(
        token_data, 
        timedelta(minutes=30)
    )
    
    # Return full user info like regular login
    return {
        "isNewUser": False,
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.idUser,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "phoneNumber": user.phoneNumber,
        "gender": user.gender,
        "theme": user.theme,
        "language": user.language
    }

def verify_google_token(token: str):
    """
    Verify Google token with Google API
    """
    try:
        # Try ID token verification first
        response = requests.get(
            f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}"
        )
        if response.status_code == 200:
            return response.json()
        
        # Fall back to access token verification
        response = requests.get(
            f"https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            return response.json()
            
        return None
    except Exception as e:
        print(f"Error verifying Google token: {e}")
        return None

