from cachetools import TTLCache

# Cache for 5 minutes (can change per API)
cache_5min = TTLCache(maxsize=200, ttl=300)
cache_1hr = TTLCache(maxsize=500, ttl=3600)