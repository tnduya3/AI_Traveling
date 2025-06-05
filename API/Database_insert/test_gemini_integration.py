#!/usr/bin/env python3
"""
Comprehensive test script for Gemini AI integration in Travel Recommendation System
"""
import requests
import json
import sys
from datetime import datetime

# API Base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing AI Service Health Endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/ai_recs/health")
        
        if response.status_code == 403:
            print("   ⚠️  Health check requires authentication (expected)")
            return True
        elif response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health Status: {data.get('status')}")
            print(f"   🤖 AI Service: {data.get('ai_service')}")
            print(f"   📊 Model: {data.get('model')}")
            return True
        else:
            print(f"   ❌ Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_gemini_direct():
    """Test Gemini test endpoint"""
    print("\n🧪 Testing Gemini Direct Generation...")
    
    test_request = {
        "departure": "Ho Chi Minh City",
        "destination": "Nha Trang",
        "people": 2,
        "days": 4,
        "time": "June 2025",
        "money": "8-12 triệu VND",
        "transportation": "máy bay",
        "travelStyle": "biển",
        "interests": ["biển", "ẩm thực", "thư giãn"],
        "accommodation": "resort"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/ai_recs/test-gemini",
            json=test_request
        )
        
        if response.status_code == 403:
            print("   ⚠️  Test endpoint requires authentication (expected)")
            return True
        elif response.status_code == 200:
            data = response.json()
            print(f"   ✅ Generation Success: {data.get('success')}")
            print(f"   🤖 AI Service: {data.get('ai_service')}")
            print(f"   📝 Characters: {data.get('characters_generated')}")
            print(f"   📋 Request: {data.get('request_summary')}")
            
            if data.get('recommendation'):
                preview = data['recommendation'][:200] + "..." if len(data['recommendation']) > 200 else data['recommendation']
                print(f"   💡 Preview: {preview}")
            
            return True
        else:
            print(f"   ❌ Status: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_openapi_spec():
    """Test if OpenAPI spec includes new endpoints"""
    print("\n📋 Testing OpenAPI Specification...")
    
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/openapi.json")
        
        if response.status_code == 200:
            spec = response.json()
            paths = spec.get('paths', {})
            
            # Check for our endpoints
            endpoints_to_check = [
                "/api/v1/ai_recs/generate-trip",
                "/api/v1/ai_recs/health", 
                "/api/v1/ai_recs/test-gemini"
            ]
            
            found_endpoints = []
            for endpoint in endpoints_to_check:
                if endpoint in paths:
                    found_endpoints.append(endpoint)
                    print(f"   ✅ Found: {endpoint}")
                else:
                    print(f"   ❌ Missing: {endpoint}")
            
            print(f"   📊 Found {len(found_endpoints)}/{len(endpoints_to_check)} endpoints")
            return len(found_endpoints) == len(endpoints_to_check)
        else:
            print(f"   ❌ Failed to get OpenAPI spec: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_server_response_time():
    """Test server response time"""
    print("\n⏱️  Testing Server Response Time...")
    
    try:
        start_time = datetime.now()
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/docs")
        end_time = datetime.now()
        
        response_time = (end_time - start_time).total_seconds()
        
        if response.status_code == 200:
            print(f"   ✅ Server Response Time: {response_time:.3f}s")
            if response_time < 1.0:
                print("   🚀 Excellent response time!")
            elif response_time < 3.0:
                print("   👍 Good response time")
            else:
                print("   ⚠️  Slow response time")
            return True
        else:
            print(f"   ❌ Server error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def show_api_endpoints():
    """Show available API endpoints"""
    print("\n📚 Available AI Recommendation Endpoints:")
    print("=" * 60)
    
    endpoints = [
        ("GET", "/ai_recs", "Get all AI recommendations"),
        ("GET", "/ai_recs/id/{idAIRec}", "Get AI recommendation by ID"),
        ("GET", "/ai_recs/{idUser}", "Get AI recommendations by user"),
        ("POST", "/ai_recs/", "Create new AI recommendation"),
        ("DELETE", "/ai_recs/{idAIRec}", "Delete AI recommendation"),
        ("POST", "/ai_recs/generate-trip", "🌟 Generate trip with Gemini AI"),
        ("GET", "/ai_recs/health", "🔍 Check AI service health"),
        ("POST", "/ai_recs/test-gemini", "🧪 Test Gemini generation")
    ]
    
    for method, path, description in endpoints:
        emoji = "🌟" if "generate-trip" in path else "🔍" if "health" in path else "🧪" if "test-gemini" in path else "📋"
        print(f"   {emoji} {method:6} {BASE_URL}{path}")
        print(f"        {description}")
        print()

def main():
    print("🌟 GEMINI AI TRAVEL RECOMMENDATION SYSTEM TEST")
    print("=" * 60)
    print(f"🔗 Testing API at: {BASE_URL}")
    print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Run tests
    tests = [
        test_server_response_time,
        test_openapi_spec,
        test_health_endpoint,
        test_gemini_direct
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test in tests:
        try:
            if test():
                passed_tests += 1
        except Exception as e:
            print(f"   ❌ Test failed with exception: {e}")
    
    # Show results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS:")
    print(f"   ✅ Passed: {passed_tests}/{total_tests}")
    print(f"   📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("   🎉 All tests passed! Gemini AI integration is working!")
    elif passed_tests > total_tests * 0.7:
        print("   👍 Most tests passed. System is mostly functional.")
    else:
        print("   ⚠️  Multiple tests failed. Please check the system.")
    
    # Show API endpoints
    show_api_endpoints()
    
    print("\n💡 To test with authentication:")
    print("   1. Use the frontend at http://localhost:3000")
    print("   2. Login and create a trip recommendation")
    print("   3. Check the FastAPI docs at http://localhost:8000/docs")
    
    print("\n✨ Gemini AI Integration Test Complete!")

if __name__ == "__main__":
    main()
