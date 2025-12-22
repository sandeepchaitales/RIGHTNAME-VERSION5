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
import whois
import asyncio
import random

# Import custom modules
from schemas import BrandEvaluationRequest, BrandEvaluationResponse, StatusCheck, StatusCheckCreate
from prompts import SYSTEM_PROMPT
from visibility import check_visibility # Import Visibility Checker

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

# Create the main app
app = FastAPI()

# Router
api_router = APIRouter(prefix="/api")

def check_domain_availability(brand_name: str) -> str:
    """
    Checks if {brand_name}.com is available using whois.
    """
    domain = f"{brand_name.lower().replace(' ', '')}.com"
    try:
        w = whois.whois(domain)
        if w.domain_name or w.creation_date:
            return f"{domain}: TAKEN (Registered). Use this FACT. Do not say it might be available."
        else:
            return f"{domain}: LIKELY AVAILABLE (No whois record found)."
    except Exception as e:
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
    # Initialize LLM with High-Quality Model (GPT-4o) on every request to ensure fresh session
    if LlmChat and EMERGENT_KEY:
        # Reverting to GPT-4o for maximum quality as requested ("Power Tool")
        llm_chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"rightname_{uuid.uuid4()}", # Unique session per request
            system_message=SYSTEM_PROMPT
        ).with_model("openai", "gpt-4o")
    else:
        raise HTTPException(status_code=500, detail="LLM Integration not initialized (Check EMERGENT_LLM_KEY)")
    
    # 1. Check Domains
    domain_statuses = []
    for brand in request.brand_names:
        status = check_domain_availability(brand)
        domain_statuses.append(f"- {brand}: {status}")
    domain_context = "\n".join(domain_statuses)

    # 2. Check Visibility (Search & App Store)
    visibility_data = []
    for brand in request.brand_names:
        vis = check_visibility(brand)
        visibility_data.append(f"BRAND: {brand}")
        visibility_data.append("GOOGLE TOP RESULTS:")
        for res in vis['google'][:10]:
            visibility_data.append(f"  - {res}")
        visibility_data.append("APP STORE RESULTS:")
        for res in vis['apps'][:5]:
            visibility_data.append(f"  - {res}")
        visibility_data.append("---")
    
    visibility_context = "\n".join(visibility_data)
    
    # Construct User Message with REAL Data
    user_prompt = f"""
    Evaluate the following brands:
    Brands: {request.brand_names}
    Category: {request.category}
    Positioning: {request.positioning}
    Market Scope: {request.market_scope}
    Target Countries: {request.countries}

    REAL-TIME DOMAIN AVAILABILITY DATA (DO NOT HALLUCINATE):
    {domain_context}
    INSTRUCTION: Use the above domain data for 'domain_analysis'.

    REAL-TIME SEARCH & APP STORE VISIBILITY DATA:
    {visibility_context}
    INSTRUCTION: Use the above visibility data to populate 'visibility_analysis'.
    - If the top result is a verified brand, open-source framework, or movie title, set 'warning_triggered' to true and explain why in 'warning_reason'.
    - List the top found brands/apps in the JSON fields.
    """
    
    # Retry Logic for 502 Errors
    max_retries = 3
    last_error = None
    
    for attempt in range(max_retries):
        try:
            user_message = UserMessage(text=user_prompt)
            response = await llm_chat.send_message(user_message)
            
            # Parse JSON
            content = ""
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
            
            # Validate
            evaluation = BrandEvaluationResponse(**data)
            
            # Save
            doc = evaluation.model_dump()
            doc['created_at'] = datetime.now(timezone.utc).isoformat()
            doc['request'] = request.model_dump()
            await db.evaluations.insert_one(doc)
            
            return evaluation
            
        except Exception as e:
            last_error = e
            error_msg = str(e)
            
            # If it's a budget error, fail immediately (retrying won't help)
            if "Budget has been exceeded" in error_msg:
                logging.error(f"LLM Budget Exceeded: {error_msg}")
                raise HTTPException(status_code=402, detail="Emergent Key Budget Exceeded. Please add credits to generate high-quality reports.")
            
            # If it's a 502/BadGateway, wait and retry
            if "502" in error_msg or "BadGateway" in error_msg or "ServiceUnavailable" in error_msg:
                wait_time = (2 ** attempt) + random.uniform(0, 1) # Exponential backoff
                logging.warning(f"LLM 502 Error (Attempt {attempt+1}/{max_retries}). Retrying in {wait_time:.2f}s...")
                await asyncio.sleep(wait_time)
                continue
            
            # Other errors (parsing, logic) - log and fail
            logging.error(f"LLM Error: {error_msg}")
            break
            
    # If we get here, all retries failed
    raise HTTPException(status_code=500, detail=f"Analysis failed after retries: {str(last_error)}")

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
