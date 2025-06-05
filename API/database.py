from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import os
import logging
import pathlib

# Cấu hình log
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Xác định đường dẫn tới file .env
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
env_file = os.path.join(BASE_DIR, ".env")

# Kiểm tra sự tồn tại của file .env
if os.path.isfile(env_file):
    logger.info(f"✅ Tìm thấy file .env tại: {env_file}")
    # Load biến môi trường
    load_dotenv(env_file)
else:
    logger.error(f"❌ Không tìm thấy file .env tại: {env_file}")

# Lấy giá trị DATABASE_URL từ biến môi trường hoặc sử dụng giá trị mặc định
DATABASE_URL = os.getenv("DATABASE_URL")
# Use a raw string to avoid escaping issues

try:
    engine = create_engine(DATABASE_URL)
    sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("✅ Đã kết nối đến PostgreSQL database thành công.")
    logger.info(f"✅ Kết nối với URL: {DATABASE_URL}")
except SQLAlchemyError as e:
    logger.error("❌ Kết nối đến database thất bại.")
    logger.error(f"❌ Database URL: {DATABASE_URL}")
    logger.exception(e)
    raise e  # bắt buộc raise để FastAPI biết lỗi

Base = declarative_base()  # Create a new base class for models

# Get session and work with database
def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()