import urllib.request
import json

req = urllib.request.Request('https://api.codingboss.in/herbal/products/', headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("Data type:", type(data))
        if isinstance(data, list):
            print("Total products:", len(data))
            print("First product sample:", json.dumps(data[0], indent=2))
        elif isinstance(data, dict):
            print("Keys:", data.keys())
            if 'results' in data:
                print("Count:", data.get('count'), "Results length:", len(data['results']))
                print("First product sample:", json.dumps(data['results'][0], indent=2))
except Exception as e:
    print("Error:", e)
