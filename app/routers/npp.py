from fastapi import APIRouter
from app.utils.fetcher import fetch_json
from app.utils.cache import cache_5min

router = APIRouter(prefix="/npp", tags=["NPP India API"])

BASE_NPP = "https://npp.gov.in/dashBoard"


@router.get("/installed-capacity")
async def installed_capacity():
    url = f"{BASE_NPP}/get_installed_capacity_list"
    if "installed_capacity" in cache_5min:
        return cache_5min["installed_capacity"]
    data = await fetch_json(url)
    cache_5min["installed_capacity"] = data
    return data


@router.get("/generation-chart")
async def generation_chart():
    url = f"{BASE_NPP}/get_generation_chart_list"
    if "generation_chart" in cache_5min:
        return cache_5min["generation_chart"]
    data = await fetch_json(url)
    cache_5min["generation_chart"] = data
    return data


@router.get("/transmission")
async def transmission():
    url = f"{BASE_NPP}/getTransmissionLine?ID=IND"
    if "transmission" in cache_5min:
        return cache_5min["transmission"]
    data = await fetch_json(url)
    cache_5min["transmission"] = data
    return data


@router.get("/map-data")
async def map_data():
    url = f"{BASE_NPP}/getBMapData?ID=IND"
    if "map_data" in cache_5min:
        return cache_5min["map_data"]
    data = await fetch_json(url)
    cache_5min["map_data"] = data
    return data
