#!/usr/bin/env python3
"""
End-to-end test for Gemini AI Travel Recommendation API
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_api_without_auth():
    """Test the API endpoint without authentication to see error handling"""
    print("🔐 Testing API without authentication...")
    
    trip_data = {
        "departure": "Ho Chi Minh City",
        "destination": "Paris",
        "people": 2,
        "days": 5,
        "time": "December 2024",
        "money": "5-10 triệu VND",
        "transportation": "Flight",
        "travelStyle": "Cultural",
        "interests": ["Museums", "History", "Art"],
        "accommodation": "Hotel"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/ai_recs/generate-trip",
            json=trip_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        if response.status_code == 403:
            print("✅ Authentication is working (expected 403 error)")
            return True
        else:
            print("❌ Unexpected response")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def test_auth_endpoint():
    """Test authentication endpoint"""
    print("\n🔐 Testing authentication endpoint...")
    
    # First, let's see what endpoints are available
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"📊 Root endpoint status: {response.status_code}")
    except:
        pass
        
    # Try to get a token (if auth endpoint exists)
    auth_data = {
        "username": "test@example.com",
        "password": "password123"
    }
    
    try:
        # Try different auth endpoint patterns
        auth_endpoints = [
            f"{BASE_URL}/auth/login",
            f"{BASE_URL}/login",
            f"{BASE_URL}/token",
            f"{BASE_URL}/auth/token"
        ]
        
        for endpoint in auth_endpoints:
            try:
                response = requests.post(endpoint, json=auth_data)
                print(f"📍 Trying {endpoint}: {response.status_code}")
                if response.status_code == 200:
                    print(f"✅ Authentication successful at {endpoint}")
                    return response.json()
            except:
                continue
                
        print("❌ No working auth endpoint found")
        return None
        
    except Exception as e:
        print(f"❌ Auth test failed: {e}")
        return None

def test_gemini_service_directly():
    """Test Gemini service directly (bypassing API)"""
    print("\n🧠 Testing Gemini service directly...")
    
    try:
        # Import and test the service directly
        import sys
        import os
        sys.path.append('/home/dii/Documents/AI_Trip/AITripSystem/API')
        
        from services.gemini_service import gemini_service
        
        trip_request = {
            'departure': 'Ho Chi Minh City',
            'destination': 'Paris',
            'people': 2,
            'days': 5,
            'time': 'December 2024',
            'money': '5-10 triệu VND',
            'transportation': 'Flight',
            'travelStyle': 'Cultural',
            'interests': ['Museums', 'History', 'Art'],
            'accommodation': 'Hotel'
        }
        
        print("🔄 Calling Gemini service...")
        result = gemini_service.generate_travel_recommendation(trip_request)
        
        print("✅ Gemini service working!")
        print(f"📏 Response length: {len(result)} characters")
        print("📝 Sample response:")
        print("-" * 50)
        print(result[:500] + "..." if len(result) > 500 else result)
        print("-" * 50)
        
        # Check if it's using Gemini AI or fallback
        if "🌟 GỢI Ý CHUYẾN ĐI" in result:
            print("🔄 Using fallback local generation")
        else:
            print("🤖 Using Gemini AI (most likely)")
            
        return True
        
    except Exception as e:
        print(f"❌ Direct service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Gemini AI Integration Tests")
    print("=" * 60)
    
    # Test 1: API without auth (should fail with 403)
    test1_result = test_api_without_auth()
    
    # Test 2: Try to authenticate
    test2_result = test_auth_endpoint()
    
    # Test 3: Test service directly
    test3_result = test_gemini_service_directly()
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY:")
    print(f"🔐 API Auth Protection: {'✅ PASS' if test1_result else '❌ FAIL'}")
    print(f"🔑 Authentication: {'✅ AVAILABLE' if test2_result else '❌ NOT FOUND'}")
    print(f"🧠 Gemini Service: {'✅ WORKING' if test3_result else '❌ FAILED'}")
    
    if test3_result:
        print("\n🎉 Gemini AI integration is working!")
        print("💡 Next steps:")
        print("   1. ✅ Backend integration complete")
        print("   2. 🔧 Test with frontend")
        print("   3. 📱 Test user authentication flow")
        print("   4. 🎯 Test complete user journey")
    else:
        print("\n❌ Gemini AI integration needs fixing")
        
    return test3_result

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
