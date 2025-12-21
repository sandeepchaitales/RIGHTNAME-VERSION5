from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Literal
from datetime import datetime, timezone
import uuid

class DimensionScore(BaseModel):
    name: str
    score: float
    reasoning: str

class TrademarkRiskRow(BaseModel):
    likelihood: int
    severity: int
    zone: Literal["Green", "Yellow", "Red"]
    commentary: str

class TrademarkRiskMatrix(BaseModel):
    genericness: TrademarkRiskRow
    existing_conflicts: TrademarkRiskRow
    phonetic_similarity: TrademarkRiskRow
    relevant_classes: TrademarkRiskRow
    rebranding_probability: TrademarkRiskRow
    overall_assessment: str

class DomainAnalysis(BaseModel):
    exact_match_status: str
    alternatives: List[Dict[str, str]]  # e.g., {"domain": "getbrand.com", "example": "Used by ..."}
    strategy_note: str

class CountryAnalysis(BaseModel):
    country: str
    cultural_resonance_score: float
    cultural_notes: str
    linguistic_check: str

class Competitor(BaseModel):
    name: str
    positioning: str
    price_range: str

class CompetitorAnalysis(BaseModel):
    competitors: List[Competitor]
    white_space_analysis: str
    strategic_advantage: str
    suggested_pricing: str

class BrandScore(BaseModel):
    brand_name: str
    namescore: float
    verdict: Literal["GO", "CONDITIONAL GO", "NO-GO", "REJECT"]
    summary: str
    strategic_classification: str
    pros: List[str]
    cons: List[str]
    dimensions: List[DimensionScore]
    # Keep old trademark_risk for backward compat if needed, or just use the new matrix. 
    # The prompt implies adding a NEW column/section. I will keep the simple risk for summary card, and add matrix for detailed view.
    trademark_risk: dict # Simplified for summary
    trademark_matrix: TrademarkRiskMatrix # NEW
    domain_analysis: DomainAnalysis # NEW
    cultural_analysis: List[CountryAnalysis]
    competitor_analysis: Optional[CompetitorAnalysis] = None
    positioning_fit: str

class BrandEvaluationRequest(BaseModel):
    brand_names: List[str]
    category: str
    positioning: Literal["Mass", "Premium", "Ultra-Premium"]
    market_scope: Literal["Single Country", "Multi-Country", "Global"]
    countries: List[str]

class BrandEvaluationResponse(BaseModel):
    executive_summary: str
    brand_scores: List[BrandScore]
    comparison_verdict: str

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str
