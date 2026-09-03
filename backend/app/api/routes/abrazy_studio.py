"""Abrazy Studio - Advanced Prompt Enhancement API"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models import User

router = APIRouter(prefix="/enhance-prompt", tags=["abrazy-studio"])


class PromptEnhanceRequest(BaseModel):
    prompt: str
    agent_id: str | None = None
    enhancement_level: str = "advanced"  # basic, intermediate, advanced


class PromptEnhanceResponse(BaseModel):
    original_prompt: str
    enhanced_prompt: str
    improvements: list[str]
    agent_context: str | None = None


# Agent-specific enhancement templates
AGENT_TEMPLATES = {
    "1": {  # Abrazy Assistant
        "prefix": "[General Query - Comprehensive Response Required]",
        "suffix": "\n\nPlease provide: 1) Direct answer 2) Detailed explanation 3) Examples 4) Follow-up suggestions",
    },
    "2": {  # Research Engine
        "prefix": "[Research Request - Academic Level Response]",
        "suffix": "\n\nPlease include: 1) Multiple sources 2) Data/statistics 3) Different perspectives 4) Summary with key insights",
    },
    "3": {  # Code Wizard
        "prefix": "[Programming Query - Technical Response]",
        "suffix": "\n\nPlease provide: 1) Code solution with comments 2) Best practices 3) Potential issues 4) Alternative approaches",
    },
    "4": {  # Content Master
        "prefix": "[Content Creation Request - Creative Response]",
        "suffix": "\n\nPlease deliver: 1) Engaging content 2) SEO-optimized 3) Multiple variations 4) Target audience consideration",
    },
    "5": {  # Business Brain
        "prefix": "[Business Strategy Query - Strategic Analysis]",
        "suffix": "\n\nPlease include: 1) Market analysis 2) Strategic recommendations 3) Risk assessment 4) Implementation plan",
    },
}


def enhance_prompt_basic(prompt: str, agent_id: str | None) -> tuple[str, list[str]]:
    """Basic enhancement: Add context and structure"""
    improvements = []
    
    # Add agent-specific context
    template = AGENT_TEMPLATES.get(agent_id or "1", AGENT_TEMPLATES["1"])
    
    enhanced = f"{template['prefix']}\n\n{prompt}{template['suffix']}"
    improvements.append("Added agent-specific context")
    improvements.append("Structured response requirements")
    
    return enhanced, improvements


def enhance_prompt_intermediate(prompt: str, agent_id: str | None) -> tuple[str, list[str]]:
    """Intermediate enhancement: Add reasoning and examples"""
    enhanced, improvements = enhance_prompt_basic(prompt, agent_id)
    
    # Add reasoning instructions
    enhanced += "\n\n[Reasoning Process]: Think step-by-step before responding."
    improvements.append("Added step-by-step reasoning requirement")
    
    # Add example requirement
    if "how" in prompt.lower() or "what" in prompt.lower():
        enhanced += "\n[Examples Required]: Include at least 2 practical examples."
        improvements.append("Requested practical examples")
    
    return enhanced, improvements


def enhance_prompt_advanced(prompt: str, agent_id: str | None) -> tuple[str, list[str]]:
    """Advanced enhancement: Full optimization with context, reasoning, and quality checks"""
    enhanced, improvements = enhance_prompt_intermediate(prompt, agent_id)
    
    # Add quality requirements
    enhanced += "\n\n[Quality Standards]:"
    enhanced += "\n- Accuracy: Verify all information"
    enhanced += "\n- Completeness: Cover all aspects"
    enhanced += "\n- Clarity: Use clear, concise language"
    enhanced += "\n- Actionability: Provide actionable insights"
    improvements.append("Added quality control standards")
    
    # Add output format
    enhanced += "\n\n[Output Format]: Use markdown formatting with headers, lists, and code blocks where appropriate."
    improvements.append("Specified output formatting")
    
    # Add follow-up
    enhanced += "\n\n[Follow-up]: Suggest related questions user might ask."
    improvements.append("Requested follow-up suggestions")
    
    return enhanced, improvements


@router.post("", response_model=PromptEnhanceResponse)
async def enhance_prompt(
    request: PromptEnhanceRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    🎯 Abrazy Studio - Advanced Prompt Enhancement
    
    Takes user's original prompt and enhances it for optimal AI response:
    - Adds context and structure
    - Includes agent-specific optimizations
    - Adds reasoning requirements
    - Specifies quality standards
    - Formats output requirements
    
    Enhancement Levels:
    - basic: Simple context addition
    - intermediate: Context + reasoning
    - advanced: Full optimization (recommended)
    """
    
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    # Select enhancement level
    if request.enhancement_level == "basic":
        enhanced, improvements = enhance_prompt_basic(request.prompt, request.agent_id)
    elif request.enhancement_level == "intermediate":
        enhanced, improvements = enhance_prompt_intermediate(request.prompt, request.agent_id)
    else:  # advanced (default)
        enhanced, improvements = enhance_prompt_advanced(request.prompt, request.agent_id)
    
    # Get agent context
    agent_context = None
    if request.agent_id and request.agent_id in AGENT_TEMPLATES:
        agent_name = {
            "1": "Abrazy Assistant",
            "2": "Research Engine",
            "3": "Code Wizard",
            "4": "Content Master",
            "5": "Business Brain",
        }.get(request.agent_id)
        agent_context = f"Optimized for {agent_name}"
    
    return PromptEnhanceResponse(
        original_prompt=request.prompt,
        enhanced_prompt=enhanced,
        improvements=improvements,
        agent_context=agent_context,
    )


@router.post("/batch", response_model=list[PromptEnhanceResponse])
async def enhance_prompts_batch(
    prompts: list[PromptEnhanceRequest],
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Enhance multiple prompts at once (batch processing)"""
    
    if len(prompts) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 prompts per batch")
    
    results = []
    for req in prompts:
        if req.enhancement_level == "basic":
            enhanced, improvements = enhance_prompt_basic(req.prompt, req.agent_id)
        elif req.enhancement_level == "intermediate":
            enhanced, improvements = enhance_prompt_intermediate(req.prompt, req.agent_id)
        else:
            enhanced, improvements = enhance_prompt_advanced(req.prompt, req.agent_id)
        
        results.append(
            PromptEnhanceResponse(
                original_prompt=req.prompt,
                enhanced_prompt=enhanced,
                improvements=improvements,
                agent_context=None,
            )
        )
    
    return results
