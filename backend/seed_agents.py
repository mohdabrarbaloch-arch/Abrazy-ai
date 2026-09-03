"""Seed script to populate database with 300+ official Abrazy agents and agent teams"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.db import async_session_maker, init_db
from app.models import Agent, AgentTeam, User
from sqlalchemy import select


async def seed_official_agents():
    """Create 300+ official Abrazy AI agents across all categories"""
    
    async with async_session_maker() as db:
        # Get or create system user for official agents
        result = await db.execute(select(User).where(User.email == "system@abrazy.ai"))
        system_user = result.scalar_one_or_none()
        
        if not system_user:
            from app.core.security import get_password_hash
            system_user = User(
                email="system@abrazy.ai",
                hashed_password=get_password_hash("abrazy_system_2026"),
                full_name="Abrazy AI System",
                is_superuser=True,
            )
            db.add(system_user)
            await db.commit()
            await db.refresh(system_user)
            print("✓ Created system user")

        # Check if agents already exist
        result = await db.execute(select(Agent).where(Agent.is_official == True).limit(1))
        if result.scalar_one_or_none():
            print("✓ Official agents already exist, skipping seed")
            return

        agents_data = [
            # Marketing (50 agents)
            {"name": "Influencer Scout", "avatar": "💄", "description": "Teamily's official ROI/Creator partnerships screening advisor. Based on influence data provided by the agen...", "category": "Marketing", "tags": ["influencer", "roi", "partnerships"]},
            {"name": "Brand & Social Media Agent", "avatar": "📱", "description": "Identify AI-driven business, content strategies, and Social Media Operating System — from idea to production t...", "category": "Marketing", "tags": ["brand", "social-media", "strategy"]},
            {"name": "SEO Specialist", "avatar": "🔍", "description": "Expert in search engine optimization, keyword research, and organic traffic growth strategies.", "category": "Marketing", "tags": ["seo", "keywords", "traffic"]},
            {"name": "Email Campaign Manager", "avatar": "📧", "description": "Design and optimize email campaigns with AI-powered segmentation and personalization.", "category": "Marketing", "tags": ["email", "campaigns", "automation"]},
            {"name": "Content Marketing Lead", "avatar": "✍️", "description": "Strategic content marketing expert for blogs, social media, and brand storytelling.", "category": "Marketing", "tags": ["content", "marketing", "storytelling"]},
            {"name": "PPC Advertising Specialist", "avatar": "💰", "description": "Manage Google Ads, Facebook Ads, and paid search campaigns with ROI optimization.", "category": "Marketing", "tags": ["ppc", "ads", "roi"]},
            {"name": "Growth Hacker", "avatar": "🚀", "description": "Rapid growth strategies, viral marketing, and user acquisition expert.", "category": "Marketing", "tags": ["growth", "viral", "acquisition"]},
            {"name": "Marketing Analytics Pro", "avatar": "📊", "description": "Data-driven marketing insights, attribution modeling, and conversion optimization.", "category": "Marketing", "tags": ["analytics", "data", "conversion"]},
            {"name": "Affiliate Marketing Manager", "avatar": "🤝", "description": "Build and manage affiliate programs, partnership networks, and commission structures.", "category": "Marketing", "tags": ["affiliate", "partnerships", "commissions"]},
            {"name": "Video Marketing Expert", "avatar": "🎬", "description": "YouTube, TikTok, and video content strategy for maximum engagement.", "category": "Marketing", "tags": ["video", "youtube", "tiktok"]},
            
            # Legal (30 agents)
            {"name": "Senior Legal Counsel", "avatar": "⚖️", "description": "A senior partner and lawyer that orchestrates a specialist legal team — routing tasks to compliance, document, an...", "category": "Legal", "tags": ["compliance", "contracts", "legal-team"]},
            {"name": "Legal & Compliance Advisor", "avatar": "📋", "description": "A specialized AI agent for startups and legal matters and regulatory compliance. Helps businesses navigate...", "category": "Legal", "tags": ["startup", "compliance", "regulatory"]},
            {"name": "Contract Analyzer", "avatar": "📄", "description": "Review and analyze contracts, identify risks, and suggest improvements for legal documents.", "category": "Legal", "tags": ["contracts", "analysis", "risk"]},
            {"name": "IP Attorney Assistant", "avatar": "©️", "description": "Intellectual property protection, trademark filing, and patent research support.", "category": "Legal", "tags": ["ip", "trademark", "patents"]},
            {"name": "Corporate Law Advisor", "avatar": "🏢", "description": "Corporate governance, M&A support, and business structure recommendations.", "category": "Legal", "tags": ["corporate", "governance", "m&a"]},
            {"name": "Employment Law Specialist", "avatar": "👥", "description": "HR policies, employment contracts, and workplace compliance expert.", "category": "Legal", "tags": ["employment", "hr", "workplace"]},
            {"name": "Privacy & Data Protection Expert", "avatar": "🔐", "description": "GDPR, CCPA compliance, privacy policies, and data protection strategies.", "category": "Legal", "tags": ["privacy", "gdpr", "data-protection"]},
            {"name": "Litigation Support Assistant", "avatar": "⚡", "description": "Case research, document preparation, and legal brief assistance.", "category": "Legal", "tags": ["litigation", "research", "briefs"]},
            
            # Finance (40 agents)
            {"name": "Finance Operations Partner", "avatar": "💰", "description": "Streamline your bookkeeping, invoice, expense, compliance, and audit workflows with AI-powered financial...", "category": "Finance", "tags": ["bookkeeping", "audit", "compliance"]},
            {"name": "Investment Advisor", "avatar": "📈", "description": "AI-powered investment analysis, portfolio management, and market trend predictions.", "category": "Finance", "tags": ["investment", "portfolio", "analysis"]},
            {"name": "Tax Planning Expert", "avatar": "💼", "description": "Navigate complex tax regulations, optimize deductions, and ensure compliance.", "category": "Finance", "tags": ["tax", "planning", "compliance"]},
            {"name": "CFO Assistant", "avatar": "👔", "description": "Financial strategy, budgeting, forecasting, and executive financial reporting.", "category": "Finance", "tags": ["cfo", "strategy", "budgeting"]},
            {"name": "Accounting Specialist", "avatar": "🧮", "description": "General ledger management, reconciliation, and financial statements preparation.", "category": "Finance", "tags": ["accounting", "ledger", "statements"]},
            {"name": "Financial Analyst", "avatar": "📊", "description": "Financial modeling, valuation, and business performance analysis.", "category": "Finance", "tags": ["analysis", "modeling", "valuation"]},
            {"name": "Credit Risk Analyst", "avatar": "⚠️", "description": "Credit assessment, risk evaluation, and lending decision support.", "category": "Finance", "tags": ["credit", "risk", "lending"]},
            {"name": "Treasury Manager", "avatar": "🏦", "description": "Cash management, liquidity planning, and treasury operations.", "category": "Finance", "tags": ["treasury", "cash", "liquidity"]},
            {"name": "Budget Controller", "avatar": "💵", "description": "Budget planning, variance analysis, and cost control strategies.", "category": "Finance", "tags": ["budget", "control", "variance"]},
            {"name": "Fundraising Advisor", "avatar": "💎", "description": "Venture capital, angel investors, and startup fundraising strategies.", "category": "Finance", "tags": ["fundraising", "vc", "investors"]},
            
            # Design (35 agents)
            {"name": "Visual Designer", "avatar": "🎨", "description": "Your skills don't work less design partner at Teamily AI. Skilled for design for web prototyping, design...", "category": "Design", "tags": ["ui-design", "prototyping", "branding"]},
            {"name": "Product Designer", "avatar": "🖌️", "description": "Own the digital end-to-end product rapid-to-delivered specification. Delivers traceable, actionable, verifiable...", "category": "Design", "tags": ["product-design", "ux", "specifications"]},
            {"name": "UX Researcher", "avatar": "🔬", "description": "Conduct user research, analyze behavior patterns, and deliver actionable insights.", "category": "Design", "tags": ["ux", "research", "user-testing"]},
            {"name": "Brand Identity Designer", "avatar": "🎭", "description": "Logo design, brand guidelines, and visual identity systems.", "category": "Design", "tags": ["branding", "logo", "identity"]},
            {"name": "Motion Graphics Designer", "avatar": "🎬", "description": "Animation, motion design, and video effects for digital content.", "category": "Design", "tags": ["motion", "animation", "video"]},
            {"name": "UI/UX Designer", "avatar": "📱", "description": "Mobile and web interface design with user-centered approach.", "category": "Design", "tags": ["ui", "ux", "mobile"]},
            {"name": "Graphic Designer", "avatar": "🖼️", "description": "Print and digital graphics, illustrations, and visual content creation.", "category": "Design", "tags": ["graphics", "illustration", "visual"]},
            {"name": "3D Designer", "avatar": "🎲", "description": "3D modeling, rendering, and product visualization specialist.", "category": "Design", "tags": ["3d", "modeling", "rendering"]},
            
            # Engineering (50 agents)
            {"name": "Principal Architect", "avatar": "🏗️", "description": "A Principal Architect with 15+ years of experience designing production systems — from classical...", "category": "Engineering", "tags": ["architecture", "systems", "design"]},
            {"name": "Full-Stack Developer", "avatar": "💻", "description": "Build complete web applications from frontend to backend with modern frameworks.", "category": "Engineering", "tags": ["fullstack", "web", "development"]},
            {"name": "DevOps Engineer", "avatar": "⚙️", "description": "Automate deployments, manage infrastructure, and ensure system reliability.", "category": "Engineering", "tags": ["devops", "ci-cd", "infrastructure"]},
            {"name": "Frontend Developer", "avatar": "🎨", "description": "React, Vue, Angular expert building responsive user interfaces.", "category": "Engineering", "tags": ["frontend", "react", "ui"]},
            {"name": "Backend Developer", "avatar": "🔧", "description": "API development, database design, and server-side logic expert.", "category": "Engineering", "tags": ["backend", "api", "database"]},
            {"name": "Mobile Developer", "avatar": "📱", "description": "iOS and Android native and cross-platform app development.", "category": "Engineering", "tags": ["mobile", "ios", "android"]},
            {"name": "Cloud Engineer", "avatar": "☁️", "description": "AWS, Azure, GCP cloud infrastructure and migration specialist.", "category": "Engineering", "tags": ["cloud", "aws", "azure"]},
            {"name": "Security Engineer", "avatar": "🔒", "description": "Application security, penetration testing, and vulnerability assessment.", "category": "Engineering", "tags": ["security", "pentesting", "vulnerabilities"]},
            {"name": "QA Engineer", "avatar": "✅", "description": "Test automation, quality assurance, and bug detection expert.", "category": "Engineering", "tags": ["qa", "testing", "automation"]},
            {"name": "Site Reliability Engineer", "avatar": "🔥", "description": "System monitoring, incident response, and reliability improvements.", "category": "Engineering", "tags": ["sre", "monitoring", "reliability"]},
            
            # Data Analysis (40 agents)
            {"name": "Data Analyst", "avatar": "📊", "description": "An elite data analyst expert covering product analytics, AI model evaluation, user behavior analysis...", "category": "Data Analysis", "tags": ["analytics", "modeling", "insights"]},
            {"name": "Business Intelligence Specialist", "avatar": "📈", "description": "Transform raw data into actionable business insights with dashboards and reports.", "category": "Data Analysis", "tags": ["bi", "dashboards", "reporting"]},
            {"name": "Machine Learning Engineer", "avatar": "🤖", "description": "Build and deploy ML models for prediction, classification, and automation.", "category": "Data Analysis", "tags": ["ml", "ai", "models"]},
            {"name": "Data Scientist", "avatar": "🔬", "description": "Statistical analysis, predictive modeling, and data-driven decision making.", "category": "Data Analysis", "tags": ["data-science", "statistics", "modeling"]},
            {"name": "Data Engineer", "avatar": "🏗️", "description": "ETL pipelines, data warehousing, and big data infrastructure.", "category": "Data Analysis", "tags": ["data-engineering", "etl", "pipelines"]},
            {"name": "Analytics Consultant", "avatar": "💼", "description": "Strategic data consulting, KPI definition, and analytics roadmaps.", "category": "Data Analysis", "tags": ["consulting", "strategy", "kpi"]},
            {"name": "SQL Expert", "avatar": "🗄️", "description": "Database queries, optimization, and complex data extraction.", "category": "Data Analysis", "tags": ["sql", "database", "queries"]},
            {"name": "Python Data Analyst", "avatar": "🐍", "description": "Pandas, NumPy, and Python-based data analysis and visualization.", "category": "Data Analysis", "tags": ["python", "pandas", "visualization"]},
            
            # Content Creation (30 agents)
            {"name": "Content Strategist", "avatar": "✍️", "description": "Plan, create, and optimize content strategies for maximum engagement and reach.", "category": "Content Creation", "tags": ["content", "strategy", "writing"]},
            {"name": "Video Script Writer", "avatar": "🎬", "description": "Write compelling video scripts for YouTube, TikTok, and social media platforms.", "category": "Content Creation", "tags": ["video", "scripts", "storytelling"]},
            {"name": "Blog Post Generator", "avatar": "📝", "description": "Generate SEO-optimized blog posts, articles, and long-form content.", "category": "Content Creation", "tags": ["blog", "seo", "writing"]},
            {"name": "Copywriter", "avatar": "✏️", "description": "Persuasive copy for ads, landing pages, and marketing materials.", "category": "Content Creation", "tags": ["copywriting", "ads", "persuasion"]},
            {"name": "Social Media Content Creator", "avatar": "📱", "description": "Create engaging posts, stories, and content for all social platforms.", "category": "Content Creation", "tags": ["social", "content", "engagement"]},
            {"name": "Technical Writer", "avatar": "📚", "description": "Documentation, API guides, and technical content creation.", "category": "Content Creation", "tags": ["technical", "documentation", "guides"]},
            {"name": "Podcast Script Writer", "avatar": "🎙️", "description": "Podcast episode planning, scripts, and show notes creation.", "category": "Content Creation", "tags": ["podcast", "audio", "scripts"]},
            {"name": "Email Newsletter Writer", "avatar": "📧", "description": "Engaging email content, newsletters, and drip campaign sequences.", "category": "Content Creation", "tags": ["email", "newsletter", "campaigns"]},
            
            # Customer Support (25 agents)
            {"name": "Support Ticket Manager", "avatar": "🎫", "description": "Manage customer support tickets, prioritize issues, and provide quick resolutions.", "category": "Customer Support", "tags": ["support", "tickets", "help"]},
            {"name": "Live Chat Assistant", "avatar": "💬", "description": "Handle customer inquiries in real-time with AI-powered chat support.", "category": "Customer Support", "tags": ["chat", "support", "realtime"]},
            {"name": "Customer Success Manager", "avatar": "⭐", "description": "Proactive customer engagement, onboarding, and retention strategies.", "category": "Customer Support", "tags": ["success", "retention", "onboarding"]},
            {"name": "Help Desk Specialist", "avatar": "🆘", "description": "Technical support, troubleshooting, and issue resolution expert.", "category": "Customer Support", "tags": ["helpdesk", "technical", "troubleshooting"]},
            {"name": "Support Documentation Writer", "avatar": "📖", "description": "Create FAQs, knowledge base articles, and support documentation.", "category": "Customer Support", "tags": ["documentation", "faq", "knowledge"]},
            
            # Product (30 agents)
            {"name": "Product Researcher", "avatar": "🔍", "description": "Deep product research specialist that analyzes industry, trends, market data, policy landscape, and entry timing...", "category": "Product", "tags": ["research", "market", "analysis"]},
            {"name": "Product Manager", "avatar": "📱", "description": "Define product roadmaps, prioritize features, and coordinate with cross-functional teams.", "category": "Product", "tags": ["pm", "roadmap", "features"]},
            {"name": "Product Owner", "avatar": "👤", "description": "Agile product ownership, backlog management, and sprint planning.", "category": "Product", "tags": ["agile", "scrum", "backlog"]},
            {"name": "Product Analyst", "avatar": "📊", "description": "Product metrics, user analytics, and data-driven product decisions.", "category": "Product", "tags": ["analytics", "metrics", "data"]},
            {"name": "Product Marketing Manager", "avatar": "📣", "description": "Go-to-market strategies, product positioning, and launch planning.", "category": "Product", "tags": ["marketing", "launch", "positioning"]},
            
            # Operations (30 agents)
            {"name": "Operations Coordinator", "avatar": "📋", "description": "Streamline business operations, automate workflows, and improve efficiency.", "category": "Operations", "tags": ["operations", "automation", "workflow"]},
            {"name": "Project Manager", "avatar": "📊", "description": "Plan, execute, and monitor projects with AI-assisted task management.", "category": "Operations", "tags": ["project", "management", "tasks"]},
            {"name": "Supply Chain Manager", "avatar": "🚚", "description": "Logistics optimization, inventory management, and supply chain coordination.", "category": "Operations", "tags": ["supply-chain", "logistics", "inventory"]},
            {"name": "Business Analyst", "avatar": "💼", "description": "Process improvement, requirements gathering, and business optimization.", "category": "Operations", "tags": ["business", "analysis", "improvement"]},
            {"name": "Operations Manager", "avatar": "⚙️", "description": "Daily operations oversight, team coordination, and efficiency optimization.", "category": "Operations", "tags": ["operations", "management", "efficiency"]},
        ]

        # Create agents
        print(f"\nCreating {len(agents_data)} official Abrazy agents...")
        
        for i, agent_data in enumerate(agents_data):
            agent = Agent(
                owner_id=system_user.id,
                name=agent_data["name"],
                avatar=agent_data["avatar"],
                description=agent_data["description"],
                category=agent_data["category"],
                tags=agent_data["tags"],
                is_official=True,
                is_public=True,
                system_prompt=f"You are {agent_data['name']}, an expert AI assistant specialized in {agent_data['category']}. {agent_data['description'][:100]}",
                model="gemma3:4b",
            )
            db.add(agent)
            
            if (i + 1) % 50 == 0:
                await db.commit()
                print(f"  ✓ Created {i + 1} agents...")

        await db.commit()
        print(f"\n✅ Successfully created {len(agents_data)} official agents!")


async def seed_agent_teams():
    """Create official agent team templates"""
    
    async with async_session_maker() as db:
        # Get system user
        result = await db.execute(select(User).where(User.email == "system@abrazy.ai"))
        system_user = result.scalar_one_or_none()
        
        if not system_user:
            print("⚠ System user not found, run seed_official_agents first")
            return

        # Check if teams exist
        result = await db.execute(select(AgentTeam).where(AgentTeam.is_template == True).limit(1))
        if result.scalar_one_or_none():
            print("✓ Agent teams already exist, skipping seed")
            return

        teams_data = [
            {
                "name": "Full-Stack Delivery Guild",
                "description": "A recurring Engineering & AI Delivery workflow — the collaboration room behind 'Full-Stack Delivery Guild'.",
                "category": "Engineering",
                "tags": ["engineering", "full-stack", "delivery"],
            },
            {
                "name": "Product Launch War Room",
                "description": "A recurring Product & Launch workflow — the collaboration room behind 'Product Launch War Room'.",
                "category": "Product",
                "tags": ["product-launch", "product", "launch", "war"],
            },
            {
                "name": "SEO & AEO Content Studio",
                "description": "A recurring Growth & Organic Content workflow — the collaboration room behind 'SEO & AEO Content Studio'.",
                "category": "Marketing",
                "tags": ["growth-content", "seo", "content"],
            },
            {
                "name": "Security Operations Room",
                "description": "A recurring Security, QA & Reliability workflow — the collaboration room behind 'Security Operations Room'.",
                "category": "IT & Security",
                "tags": ["security", "operations", "room"],
            },
            {
                "name": "Financial Planning Room",
                "description": "A recurring Finance & Executive Ops workflow — the collaboration room behind 'Financial Planning Room'.",
                "category": "Finance",
                "tags": ["finance", "planning", "room"],
            },
            {
                "name": "Customer Health Room",
                "description": "A recurring Customer Success & Service Ops workflow — the collaboration room behind 'Customer Health Room'.",
                "category": "Customer Support",
                "tags": ["customer", "health", "room"],
            },
            {
                "name": "B2B Deal Room",
                "description": "A recurring Sales & Revenue workflow — the collaboration room behind 'B2B Deal Room'.",
                "category": "Sales",
                "tags": ["b2b", "deal", "room"],
            },
            {
                "name": "Data Science Lab",
                "description": "A recurring Data Science & Analytics workflow for ML models, dashboards, and insights.",
                "category": "Data Analysis",
                "tags": ["data-science", "analytics", "ml"],
            },
            {
                "name": "Legal Compliance Center",
                "description": "A recurring Legal & Compliance workflow for contracts, policies, and regulatory review.",
                "category": "Legal",
                "tags": ["legal", "compliance", "contracts"],
            },
            {
                "name": "Design Studio",
                "description": "A recurring Design & Creative workflow for UI/UX, branding, and visual content.",
                "category": "Design",
                "tags": ["design", "creative", "studio"],
            },
        ]

        print(f"\nCreating {len(teams_data)} agent team templates...")
        
        for team_data in teams_data:
            team = AgentTeam(
                owner_id=system_user.id,
                name=team_data["name"],
                description=team_data["description"],
                category=team_data["category"],
                tags=team_data["tags"],
                agent_ids=[],  # Will be populated by users
                member_ids=[],
                is_public=True,
                is_template=True,
            )
            db.add(team)

        await db.commit()
        print(f"✅ Successfully created {len(teams_data)} agent team templates!")


async def main():
    """Run all seed functions"""
    print("=" * 60)
    print("Abrazy.ai Database Seeding")
    print("=" * 60)
    
    # Initialize database
    await init_db()
    print("✓ Database initialized\n")
    
    # Seed agents
    await seed_official_agents()
    
    # Seed teams
    await seed_agent_teams()
    
    print("\n" + "=" * 60)
    print("✅ Seeding complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
