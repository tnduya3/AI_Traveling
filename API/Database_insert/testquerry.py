import urllib.parse
province = "Quảng Ninh"
url = f"/api/v1/places?select=province&lookup={urllib.parse.quote(province)}"