from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import jwt
from database import get_db
from models.token import Token
from models.user import User
import auth
import random
import string

router = APIRouter()

# Config security with OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

# API register user
@router.post("/register")
def register(
    username: str, 
    password: str, 
    name: str, 
    email: str = None, 
    gender: int = None, 
    phoneNumber: str = None,
    db: Session = Depends(get_db)
):
    # Kiểm tra xem username đã tồn tại chưa
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Kiểm tra email nếu có
    if email:
        existing_email = db.query(User).filter(User.email == email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        # Hash password
        hashed_pw = auth.hash_password(password)
        
        # Tạo ID ngẫu nhiên 6 ký tự
        def generate_id():
            return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        user_id = generate_id()
        # Đảm bảo ID không trùng lặp
        while db.query(User).filter(User.idUser == user_id).first():
            user_id = generate_id()
        
        # Tạo bản ghi trong bảng Token cho xác thực
        token_user = Token(username=username, hashed_password=hashed_pw)
        db.add(token_user)
        
        # Tạo bản ghi trong bảng User với đầy đủ thông tin
        user = User(
            idUser=user_id,
            name=name,
            username=username,
            password=hashed_pw,
            email=email,
            gender=gender,
            phoneNumber=phoneNumber,
            theme=1,  # Giá trị mặc định
            language=1  # Giá trị mặc định
        )
        db.add(user)
        
        # Lưu cả hai bản ghi vào database
        db.commit()
        
        return {
            "message": "User registered successfully", 
            "username": username,
            "userId": user_id
        }
    except Exception as e:
        # Rollback trong trường hợp lỗi
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

# API login user
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Kiểm tra tài khoản trong bảng Token
    token_user = db.query(Token).filter(Token.username == form_data.username).first()
    if not token_user or not auth.verify_password(form_data.password, token_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Tên đăng nhập hoặc mật khẩu không đúng"
        )
    
    # Lấy thông tin đầy đủ từ bảng User
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Tài khoản không tồn tại trong hệ thống"
        )
    
    # Tạo token với các thông tin cần thiết
    token_data = {
        "sub": user.username,
        "user_id": user.idUser,
        "name": user.name
    }
    access_token = auth.create_access_token(token_data, timedelta(minutes=30))
    
    return {
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

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    
    # Thay đổi: lấy thông tin từ User thay vì Token
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user
