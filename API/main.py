from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import review_ctrl, trip_ctrl, trip_member_ctrl, user_ctrl, auth_ctrl, booking_ctrl, notification_ctrl, friend_ctrl, ai_recommendation_ctrl, detail_information_ctrl, place_ctrl, detail_booking_ctrl
from controllers import social_auth_ctrl

app = FastAPI()

# CORS Middleware Configuration
origins = [
    "http://localhost", # Cho phép local frontend (nếu có)
    "http://localhost:3000", 
    "http://192.168.100.225:3000",
    "http://192.168.100.225",
    "http://192.168.220.223:3000",
    "http://10.45.8.134:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Danh sách các origin được phép
    allow_credentials=True, # Cho phép gửi cookie
    allow_methods=["*"],  # Cho phép tất cả các phương thức (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"],  # Cho phép tất cả các header
)

app.include_router(auth_ctrl.router, prefix="/api/v1", tags=["auth"])
app.include_router(social_auth_ctrl.router, prefix="/api/v1", tags=["auth"])
app.include_router(user_ctrl.router, prefix="/api/v1", tags=["users"])
app.include_router(friend_ctrl.router, prefix="/api/v1", tags=["friends"])
app.include_router(notification_ctrl.router, prefix="/api/v1", tags=["notifications"])
app.include_router(trip_ctrl.router, prefix="/api/v1", tags=["trips"])
app.include_router(trip_member_ctrl.router, prefix="/api/v1", tags=["trip_members"])
app.include_router(place_ctrl.router, prefix="/api/v1", tags=["places"])
app.include_router(detail_information_ctrl.router, prefix="/api/v1", tags=["detail_informations"])
app.include_router(review_ctrl.router, prefix="/api/v1", tags=["reviews"])
app.include_router(booking_ctrl.router, prefix="/api/v1", tags=["bookings"])
app.include_router(detail_booking_ctrl.router, prefix="/api/v1", tags=["detail_bookings"])
app.include_router(ai_recommendation_ctrl.router, prefix="/api/v1", tags=["ai_recommendations"])
# app.include_router(conversation_ctrl.router, prefix="/api/v1", tags=["conversations"])
# app.include_router(message_ctrl.router, prefix="/api/v1", tags=["messages"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)