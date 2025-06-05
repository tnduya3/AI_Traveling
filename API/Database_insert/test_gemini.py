#!/usr/bin/env python3
"""
Test script for Gemini AI integration
"""
import sys
import os
sys.path.append('.')

from services.gemini_service import gemini_service

def test_gemini_service():
    """Test the Gemini AI service"""
    
    # Test data
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

    print('🚀 Testing Gemini AI Service Integration')
    print('=' * 60)
    print(f"📍 Departure: {trip_request['departure']}")
    print(f"🎯 Destination: {trip_request['destination']}")
    print(f"👥 People: {trip_request['people']}")
    print(f"📅 Duration: {trip_request['days']} days")
    print(f"💰 Budget: {trip_request['money']}")
    print(f"🎨 Style: {trip_request['travelStyle']}")
    print(f"❤️ Interests: {', '.join(trip_request['interests'])}")
    print('=' * 60)

    try:
        print("🔄 Generating recommendation...")
        result = gemini_service.generate_travel_recommendation(trip_request)
        
        print("\n✅ SUCCESS! Gemini AI Response Generated:")
        print("-" * 60)
        
        # Show first 2000 characters of response
        if len(result) > 2000:
            print(result[:2000])
            print(f"\n... (showing first 2000 of {len(result)} total characters)")
        else:
            print(result)
        
        print("-" * 60)
        print(f"📊 Total response length: {len(result)} characters")
        print("✅ Gemini AI integration test PASSED!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        print("\n🔍 Detailed error trace:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_gemini_service()
    exit(0 if success else 1)
