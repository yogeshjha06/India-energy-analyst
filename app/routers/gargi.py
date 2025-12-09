from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
import httpx
import os
import json

router = APIRouter(prefix="/gargi", tags=["Gargi AI Assistant"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

SYSTEM_PROMPT = """You are Gargi, an energy market analyst AI developed by Yogesh Kumar Jha in India. 
You specialize in Indian energy sector analysis, power generation, renewable energy, and energy policy.

Your capabilities:
- Analyze India's energy data (NPP, transmission, generation)
- Answer questions about power capacity, generation trends, renewable energy
- Provide insights on energy policy and market dynamics

IMPORTANT: Only answer questions related to energy, power, electricity, renewable energy, or Indian energy markets.
For non-energy questions, respond: This question is outside my domain. I specialize in energy sector analysis.

Response Format:
1. Provide detailed analysis (minimum 3-4 lines)
2. Include specific numbers and percentages from the data
3. ONLY include chart JSON if you have complete numerical data with valid values (not null/None)
4. Chart format: {"chart": {"type": "pie|bar|line", "title": "Chart Title", "data": [{"label": "X", "value": 123}]}}
5. Do NOT include charts if data is missing, incomplete, or contains null values
6. Explain trends and insights

Example response:
India's renewable energy capacity stands at 162,476 MW as of 2024, representing 32% of total installed capacity. This marks significant growth from near-zero in 1946. Thermal power still dominates at 243,280 MW (48%), while hydro contributes 46,928 MW (9%) and nuclear 8,180 MW (2%).

{"chart": {"type": "pie", "title": "India Energy Mix 2024", "data": [{"label": "Thermal", "value": 243280}, {"label": "Renewable", "value": 162476}, {"label": "Hydro", "value": 46928}, {"label": "Nuclear", "value": 8180}]}}
"""

ENERGY_KEYWORDS = [
    "energy", "power", "electricity", "solar", "wind", "hydro", "thermal", "nuclear",
    "renewable", "generation", "capacity", "transmission", "grid", "coal", "gas",
    "npp", "installed", "mw", "gwh", "kwh", "voltage", "transformer", "feeder",
    "consumption", "demand", "supply", "load", "frequency", "outage", "plant"
]


class ChatRequest(BaseModel):
    query: str
    use_web_search: bool = False


def is_energy_related(query: str) -> bool:
    """Check if query is energy-related"""
    query_lower = query.lower()
    return any(keyword in query_lower for keyword in ENERGY_KEYWORDS)


async def search_tavily(query: str) -> tuple[str, list]:
    """Search web using Tavily API - returns (context, sources)"""
    if not TAVILY_API_KEY:
        return "", []
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.tavily.com/search",
                headers={"Authorization": f"Bearer {TAVILY_API_KEY}"},
                json={"query": query, "max_results": 3}
            )
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                context = "\n".join([f"- {r.get('title')}: {r.get('content')}" for r in results[:3]])
                sources = [r.get('url') for r in results[:3] if r.get('url')]
                return f"\n\nWeb Search Results:\n{context}", sources
    except:
        pass
    return "", []


async def get_npp_data() -> dict:
    """Fetch NPP data from internal APIs"""
    base_url = "http://localhost:8000"
    data = {}
    
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            capacity = await client.get(f"{base_url}/npp/installed-capacity")
            if capacity.status_code == 200:
                cap_data = capacity.json()
                latest = cap_data.get("linechartforCapacity", [])[-1] if cap_data.get("linechartforCapacity") else {}
                data["capacity"] = {
                    "thermal": latest.get("installed_capacity_thermal"),
                    "hydro": latest.get("installed_capacity_hydro"),
                    "nuclear": latest.get("installed_capacity_nuclear"),
                    "renewable": latest.get("installed_capacity_res")
                }
            
            generation = await client.get(f"{base_url}/npp/generation-chart")
            if generation.status_code == 200:
                gen_data = generation.json()
                latest_gen = gen_data.get("linechartforGeneration", [])[-1] if gen_data.get("linechartforGeneration") else {}
                data["generation"] = {
                    "year": latest_gen.get("financial_year"),
                    "thermal": latest_gen.get("thermal_total"),
                    "hydro": latest_gen.get("hydro"),
                    "nuclear": latest_gen.get("nuclear"),
                    "renewable": latest_gen.get("renewable_energy_sources")
                }
            
            map_data = await client.get(f"{base_url}/npp/map-data")
            if map_data.status_code == 200:
                md = map_data.json()
                header = md.get("headerMap", {})
                data["realtime"] = {
                    "total_capacity": header.get("CP_OBJ", {}).get("installed_capacity"),
                    "online_capacity": header.get("CP_OBJ", {}).get("online_capacity"),
                    "today_generation": header.get("GN_OBJ", {}).get("actual_generation")
                }
    except:
        pass
    
    return data


@router.post("/chat")
async def chat(request: ChatRequest):
    """Chat with Gargi AI - Energy Analyst"""
    
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    
    # Check if query is energy-related
    if not is_energy_related(request.query):
        return {
            "response": "This question is outside my domain. I specialize in energy sector analysis.",
            "sources": []
        }
    
    # Get NPP data context
    npp_data = await get_npp_data()
    npp_context = f"\n\nCurrent India Energy Data:\n{json.dumps(npp_data, indent=2)}" if npp_data else ""
    
    # Get web search context if requested
    web_context = ""
    web_sources = []
    if request.use_web_search:
        web_context, web_sources = await search_tavily(request.query)
    
    # Build sources list
    sources = []
    if npp_data:
        sources.append("NPP Data")
    if web_sources:
        sources.extend(web_sources)
    
    # Build prompt
    user_message = f"{SYSTEM_PROMPT}\n\nUser Query: {request.query}{npp_context}{web_context}"
    
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=user_message
        )
        
        return {
            "response": response.text,
            "sources": sources,
            "web_search_used": request.use_web_search
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
