from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import ConfigDict, Field
from typing import List
import uuid
from datetime import datetime, timezone
import json
import whois  # Import python-whois

# Import custom modules
from schemas import BrandEvaluationRequest, BrandEvaluationResponse, StatusCheck, StatusCheckCreate
from prompts import SYSTEM_PROMPT

# Import Emergent Integration
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    logging.error("emergentintegrations not found. Ensure it is installed.")
    LlmChat = None

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'rightname_db')]

# Initialize LLM Chat
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')
if not EMERGENT_KEY:
    logging.warning("EMERGENT_LLM_KEY not found in .env")

llm_chat = None
if LlmChat and EMERGENT_KEY:
    llm_chat = LlmChat(
        api_key=EMERGENT_KEY,
        session_id="rightname_session",
        system_message=SYSTEM_PROMPT
    ).with_model("anthropic", "claude-4-sonnet-20250514")

# Create the main app
app = FastAPI()

# Router
api_router = APIRouter(prefix="/api")

def check_domain_availability(brand_name: str) -> str:
    """
    Checks if {brand_name}.com is available using whois.
    Returns a string status message.
    """
    domain = f"{brand_name.lower().replace(' ', '')}.com"
    try:
        w = whois.whois(domain)
        # If we get a valid object with domain_name or creation_date, it's taken
        if w.domain_name or w.creation_date:
            return f"{domain}: TAKEN (Registered). Use this FACT. Do not say it might be available."
        else:
            # Fallback if library returns empty object but no error (rare)
            return f"{domain}: LIKELY AVAILABLE (No whois record found)."
    except Exception as e:
        # Most "not found" results raise an exception with "No match for..."
        error_str = str(e).lower()
        if "no match for" in error_str or "not found" in error_str:
            return f"{domain}: AVAILABLE (No whois record found). Use this FACT."
        else:
            return f"{domain}: CHECK FAILED (Error: {str(e)}). Assume TAKEN to be safe."

@api_router.get("/")
async def root():
    return {"message": "RightName API is running"}

@api_router.post("/evaluate", response_model=BrandEvaluationResponse)
async def evaluate_brands(request: BrandEvaluationRequest):
    if not llm_chat:
        raise HTTPException(status_code=500, detail="LLM Integration not initialized")
    
    # Check domains for all brands
    domain_statuses = []
    for brand in request.brand_names:
        status = check_domain_availability(brand)
        domain_statuses.append(f"- {brand}: {status}")
    
    domain_context = "\n".join(domain_statuses)
    
    # Construct User Message with REAL Domain Data
    user_prompt = f"""
    Evaluate the following brands:
    Brands: {request.brand_names}
    Category: {request.category}
    Positioning: {request.positioning}
    Market Scope: {request.market_scope}
    Target Countries: {request.countries}

    REAL-TIME DOMAIN AVAILABILITY DATA (DO NOT HALLUCINATE):
    {domain_context}
    
    INSTRUCTION: In the 'domain_analysis' section, strictly use the availability data provided above. 
    If taken, say "Taken". If available, say "Available".
    """
    
    try:
        user_message = UserMessage(text=user_prompt)
        response = await llm_chat.send_message(user_message)
        
        # Parse JSON from response
        # Claude might wrap it in markdown code blocks, strip them
        # Handle both string and object responses
        if hasattr(response, 'text'):
            content = response.text
        elif isinstance(response, str):
            content = response
        else:
            content = str(response)
            
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        data = json.loads(content.strip())
        
        # Validate with Pydantic
        evaluation = BrandEvaluationResponse(**data)
        
        # Save to DB (async)
        doc = evaluation.model_dump()
        doc['created_at'] = datetime.now(timezone.utc).isoformat()
        doc['request'] = request.model_dump()
        await db.evaluations.insert_one(doc)
        
        return evaluation
        
    except Exception as e:
        logging.error(f"Error in LLM evaluation: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Status Routes
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
