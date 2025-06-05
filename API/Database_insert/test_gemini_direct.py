#!/usr/bin/env python3
"""
Direct test script for Gemini AI service without authentication
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.gemini_service import gemini_service

def test_gemini_recommendation():
    """Test Gemini AI recommendation generation directly"""
    print("🚀 Testing Gemini AI Service...")
    print("=" * 50)
    
    # Sample trip request
    trip_request = {
        "departure": "Ho Chi Minh City",
        "destination": "Da Lat",
        "people": 2,
        "days": 3,
        "time": "December 2024",
        "money": "5-10 triệu VND",
        "transportation": "xe khách",
        "travelStyle": "thư giãn",
        "interests": ["thiên nhiên", "ẩm thực", "văn hóa"],
        "accommodation": "khách sạn"
    }
    
    print("📋 TRIP REQUEST:")
    for key, value in trip_request.items():
        print(f"  {key}: {value}")
    
    print("\n🤖 Generating recommendation...")
    print("-" * 50)
    
    try:
        # Generate recommendation using Gemini service
        recommendation = gemini_service.generate_travel_recommendation(trip_request)
        
        print("✅ GEMINI AI RECOMMENDATION:")
        print("=" * 50)
        print(recommendation)
        print("=" * 50)
        
        # Check if it's using Gemini or fallback
        if gemini_service.model:
            print("\n✨ Status: Using Gemini AI")
        else:
            print("\n⚠️  Status: Using local fallback")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

def test_multiple_destinations():
    """Test with different destinations"""
    destinations = [
        {
            "departure": "Ha Noi",
            "destination": "Phu Quoc",
            "people": 4,
            "days": 5,
            "time": "Summer 2024",
            "money": "10-15 triệu VND",
            "transportation": "máy bay",
            "travelStyle": "luxury",
            "interests": ["biển", "ẩm thực", "thư giãn"],
            "accommodation": "resort"
        },
        {
            "departure": "Da Nang",
            "destination": "Hoi An",
            "people": 2,
            "days": 2,
            "time": "Weekend",
            "money": "3-5 triệu VND",
            "transportation": "xe máy",
            "travelStyle": "văn hóa",
            "interests": ["văn hóa", "shopping", "ẩm thực"],
            "accommodation": "homestay"
        }
    ]
    
    for i, trip in enumerate(destinations, 1):
        print(f"\n{'='*20} TEST {i} {'='*20}")
        print(f"🎯 {trip['departure']} → {trip['destination']}")
        
        try:
            recommendation = gemini_service.generate_travel_recommendation(trip)
            print(f"✅ Generated {len(recommendation)} characters")
            print(f"📝 Preview: {recommendation[:200]}...")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🌟 GEMINI AI TRAVEL RECOMMENDATION TEST")
    print("=" * 60)
    
    # Test 1: Single recommendation
    success = test_gemini_recommendation()
    
    if success:
        print("\n" + "="*60)
        print("🔄 Testing multiple destinations...")
        test_multiple_destinations()
    
    print("\n✅ Test completed!")
