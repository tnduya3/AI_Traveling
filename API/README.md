## Cấu hình môi trường

1.  **Tạo file `.env`:**

    *   Tạo một file mới tên là `.env` trong thư mục `API` của dự án.
    *   Sao chép nội dung sau vào file `.env` và thay đổi các giá trị cho phù hợp với cấu hình của bạn:

        ```properties
        # Cấu hình database PostgreSQL
        DATABASE_URL=postgresql://<username>:<password>@<host>:5432/<DB_Name>
        REDIS_URL=redis://localhost:6379

        # Cấu hình JWT
        SECRET_KEY=your_secret_key_here
        ALGORITHM=HS256
        ACCESS_TOKEN_EXPIRE_MINUTES=30
        ```

    *   **Lưu ý:** Thay đổi `your_secret_key_here` bằng một chuỗi bí mật mạnh mẽ để bảo mật.
    *   **Lưu ý:** Thay đổi `username` bằng username để kết nối database của bạn.
    *   **Lưu ý:** Thay đổi `password` bằng mật khẩu của bạn.
2.  **Cấu hình Database:**

    *   Truy cập vào file `create_db.py` trong thư mục `Database_insert` để tạo các bảng cần thiết trong cơ sở dữ liệu PostgreSQL của bạn. Bạn có thể sử dụng các script SQL hoặc ORM models để tạo bảng.
3.  **Khởi chạy server API:**

    *   Mở terminal và di chuyển đến thư mục  của dự án.
    *   Chạy lệnh sau để khởi chạy server API:

        ```bash
        uvicorn main:app --reload
        ```

    *   Lệnh này sẽ khởi chạy server Uvicorn với file `main.py` và ứng dụng FastAPI được đặt tên là `app`. Option `--reload` cho phép server tự động tải lại khi có thay đổi trong code.