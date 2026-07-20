import os
import google.generativeai as genai
from fastapi import APIRouter, Depends
from ..models import User
from ..schemas import AIQuestion, AIAnswer
from ..auth.security import require_any_role

# Configure Gemini AI
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

router = APIRouter(prefix="/ai", tags=["AI Safety Assistant"])

# --- Mining Safety Knowledge Base ---
KNOWLEDGE_BASE = [
    {
        "keywords": ["gas", "smell", "odor", "methane", "co", "carbon monoxide", "hydrogen sulfide", "fumes"],
        "category": "Gas Detection & Response",
        "answer": (
            "If you smell gas or your gas detector alarms:\n\n"
            "1. **STOP** all work immediately — do NOT operate any electrical equipment or create sparks\n"
            "2. **ALERT** your nearby coworkers by shouting a warning\n"
            "3. **MOVE** upwind and toward fresh air — head to the nearest ventilation source\n"
            "4. **NOTIFY** your supervisor via radio or emergency channel immediately\n"
            "5. **EVACUATE** the area following the posted evacuation route\n"
            "6. **DO NOT** return until the area has been tested and declared safe by the safety officer\n\n"
            "**Common mine gases:**\n"
            "- Methane (CH₄) — explosive, odorless\n"
            "- Carbon Monoxide (CO) — toxic, odorless\n"
            "- Hydrogen Sulfide (H₂S) — toxic, rotten egg smell\n"
            "- Nitrogen Dioxide (NO₂) — toxic after blasting"
        ),
        "related": ["What PPE is required for gas protection?", "How do I use a gas detector?", "What is the evacuation procedure?"]
    },
    {
        "keywords": ["evacuation", "evacuate", "emergency exit", "escape", "leave mine", "get out"],
        "category": "Evacuation Procedures",
        "answer": (
            "**Emergency Evacuation Procedure:**\n\n"
            "1. **Hear the alarm** — continuous siren = full evacuation\n"
            "2. **Stop** all work and secure equipment (shut off gas lines, machinery)\n"
            "3. **Grab** your Self-Contained Self-Rescuer (SCSR) and activate it\n"
            "4. **Follow** illuminated evacuation route markers (green arrows)\n"
            "5. **Proceed** to the nearest designated assembly point\n"
            "6. **Report** to your shift supervisor for headcount\n"
            "7. **Do NOT** re-enter the mine until cleared by the emergency response team\n\n"
            "**Key tips:**\n"
            "- Know your TWO nearest escape routes at all times\n"
            "- Emergency refuge chambers are marked with orange reflective tape\n"
            "- If visibility is zero, follow the lifeline/guideline rope along the wall"
        ),
        "related": ["Where are the emergency exits?", "How do I use an SCSR?", "What should I do if I smell gas?"]
    },
    {
        "keywords": ["roof", "crack", "collapse", "fall", "ground control", "support", "ceiling", "rock fall"],
        "category": "Ground Control & Roof Safety",
        "answer": (
            "**If you notice a roof crack or unstable ground:**\n\n"
            "1. **STOP** work immediately — do not go under the affected area\n"
            "2. **WARN** nearby workers to stay clear\n"
            "3. **MARK** the area with barricade tape or warning signs\n"
            "4. **REPORT** it to your supervisor immediately via radio\n"
            "5. **DOCUMENT** the issue — take a photo if safe to do so\n"
            "6. **EVACUATE** the section if the crack is active (widening)\n\n"
            "**Warning signs of roof instability:**\n"
            "- New cracks or widening existing ones\n"
            "- Flaking or crumbling rock (drummy sound when tapped)\n"
            "- Water seeping from new locations\n"
            "- Unusual sounds (popping, cracking)\n"
            "- Roof bolt plates deflecting or bolts loosening"
        ),
        "related": ["How do I report a hazard?", "What is the evacuation procedure?", "What PPE protects from rock falls?"]
    },
    {
        "keywords": ["ppe", "equipment", "protective", "helmet", "boots", "gloves", "gear", "safety wear", "blasting"],
        "category": "Personal Protective Equipment",
        "answer": (
            "**Standard PPE Required in All Mine Areas:**\n"
            "- Hard hat with lamp attachment\n"
            "- Safety glasses / goggles\n"
            "- Steel-toe safety boots\n"
            "- High-visibility vest\n"
            "- Hearing protection (earplugs/muffs)\n"
            "- Dust mask / respirator\n"
            "- Work gloves\n\n"
            "**Additional PPE for Blasting Areas:**\n"
            "- Blast-rated hearing protection (NRR 30+)\n"
            "- Full-face respirator with P100 filters\n"
            "- Flame-resistant clothing\n"
            "- Anti-static boots\n"
            "- SCSR (Self-Contained Self-Rescuer)\n\n"
            "**Additional PPE for Wet/Underground Areas:**\n"
            "- Waterproof overalls\n"
            "- Rubber boots with steel toe\n"
            "- Chemical-resistant gloves"
        ),
        "related": ["Where can I get replacement PPE?", "What should I do before entering a blasting area?", "How do I report damaged equipment?"]
    },
    {
        "keywords": ["first aid", "injury", "hurt", "cut", "bleeding", "burn", "broken", "fracture", "medical"],
        "category": "First Aid & Medical",
        "answer": (
            "**Basic First Aid in the Mine:**\n\n"
            "**For Cuts/Bleeding:**\n"
            "1. Apply direct pressure with a clean cloth\n"
            "2. Elevate the injured limb\n"
            "3. Apply bandage from first aid kit\n"
            "4. Seek medical attention for deep wounds\n\n"
            "**For Burns:**\n"
            "1. Cool with running water for 20 minutes\n"
            "2. Do NOT apply ice, butter, or creams\n"
            "3. Cover with sterile dressing\n"
            "4. Seek medical attention for burns larger than a palm\n\n"
            "**For Fractures:**\n"
            "1. Do NOT move the person unless in danger\n"
            "2. Immobilize the limb with a splint\n"
            "3. Call for medical support on emergency channel\n"
            "4. Monitor for shock\n\n"
            "**Emergency contacts:** Use the SOS button in this app or call the mine emergency number."
        ),
        "related": ["Where is the nearest first aid kit?", "How do I trigger an SOS?", "What should I do if someone is unconscious?"]
    },
    {
        "keywords": ["report", "hazard", "incident", "accident", "near miss", "log", "file", "submit"],
        "category": "Incident Reporting",
        "answer": (
            "**How to Report an Incident or Hazard:**\n\n"
            "1. **In this app:** Go to the Hazards page and tap 'Report New Hazard'\n"
            "2. **Fill in details:**\n"
            "   - Hazard type (gas leak, roof crack, equipment failure, etc.)\n"
            "   - Severity level (low, medium, high, critical)\n"
            "   - Exact location in the mine\n"
            "   - Description of the issue\n"
            "3. **Attach evidence:** Take a photo or video if safe\n"
            "4. **Use voice-to-text** if typing is difficult — tap the microphone button\n"
            "5. **Submit** — your report will be assigned to a supervisor\n\n"
            "**All incidents must be reported**, including near-misses. Near-miss reporting helps prevent future accidents.\n\n"
            "**For EMERGENCIES:** Use the SOS button on your dashboard instead."
        ),
        "related": ["How do I track my report status?", "What happens after I submit a report?", "How do I trigger an SOS?"]
    },
    {
        "keywords": ["ventilation", "air", "breathing", "oxygen", "suffocation", "confined space"],
        "category": "Ventilation & Air Quality",
        "answer": (
            "**Mine Ventilation Safety:**\n\n"
            "- Never enter an area where ventilation curtains or tubes have been damaged\n"
            "- Check air quality with your gas detector before entering confined spaces\n"
            "- If you feel shortness of breath, headache, or nausea — **exit immediately**\n"
            "- Report any disruption to ventilation (blocked airways, damaged fans)\n"
            "- Minimum oxygen level: 19.5%. Below this, **evacuate immediately**\n\n"
            "**Signs of poor air quality:**\n"
            "- Headache, dizziness, nausea\n"
            "- Unusual smells\n"
            "- Visible dust or haze\n"
            "- Animals/insects dying (canary effect)\n"
            "- Gas detector alarms"
        ),
        "related": ["What should I do if I smell gas?", "How do I use my SCSR?", "What is the evacuation procedure?"]
    },
    {
        "keywords": ["fatigue", "tired", "sleepy", "exhausted", "rest", "break", "hours", "overtime"],
        "category": "Fatigue Management",
        "answer": (
            "**Managing Fatigue in the Mine:**\n\n"
            "Fatigue is a leading cause of mining accidents. Here's what to do:\n\n"
            "1. **Take regular breaks** — at least 15 minutes every 2 hours\n"
            "2. **Stay hydrated** — drink at least 500ml of water per hour in hot conditions\n"
            "3. **Use the Health Assessment** tool in this app to log your fatigue level\n"
            "4. **Report to supervisor** if your fatigue level exceeds 7/10\n"
            "5. **Don't exceed** 12 hours of continuous work\n"
            "6. **Sleep** at least 7 hours before a shift\n\n"
            "**Warning signs that you need to stop:**\n"
            "- Difficulty concentrating or making decisions\n"
            "- Slow reaction times\n"
            "- Yawning excessively\n"
            "- Microsleeps (brief, involuntary episodes of sleep)\n"
            "- Irritability or mood changes"
        ),
        "related": ["How do I log a health assessment?", "When should I notify my supervisor?", "What are the shift time limits?"]
    },
    {
        "keywords": ["electricity", "electrical", "shock", "wire", "cable", "power"],
        "category": "Electrical Safety",
        "answer": (
            "**Electrical Safety Underground:**\n\n"
            "1. **Never** touch exposed wires or damaged cables\n"
            "2. **Report** all electrical damage immediately\n"
            "3. **Lock-out/Tag-out** before any electrical maintenance\n"
            "4. **Do NOT** use water to extinguish electrical fires — use CO₂ extinguisher\n"
            "5. **Maintain** at least 3 meters distance from high-voltage equipment\n\n"
            "**If someone is electrocuted:**\n"
            "1. Do NOT touch them if they are still in contact with the source\n"
            "2. Cut power at the nearest breaker if possible\n"
            "3. Call emergency services / trigger SOS\n"
            "4. Begin CPR if the person is unresponsive and not breathing\n"
            "5. Treat burns after the person is free from electrical contact"
        ),
        "related": ["How do I report a hazard?", "Where is the nearest first aid kit?", "How do I trigger an SOS?"]
    },
    {
        "keywords": ["water", "flood", "pump", "drainage", "seepage", "inrush"],
        "category": "Water Hazards",
        "answer": (
            "**Water Hazard Response:**\n\n"
            "1. **Report** any unusual water inflow to your supervisor immediately\n"
            "2. **Move upslope** if water is rising — never walk through flowing water\n"
            "3. **Evacuate** if water levels are rising rapidly\n"
            "4. **Check pumps** are operational at the start of each shift\n"
            "5. **Mark** areas with standing water as slip hazards\n\n"
            "**Warning signs of inrush:**\n"
            "- Sudden increase in water seepage\n"
            "- Discolored or muddy water\n"
            "- Ground becoming soft or unstable\n"
            "- Cracking sounds from walls or floor"
        ),
        "related": ["What is the evacuation procedure?", "How do I report a hazard?", "What should I do if the ground is unstable?"]
    },
    {
        "keywords": ["explosive", "blast", "detonator", "dynamite", "shot", "firing"],
        "category": "Blasting Safety",
        "answer": (
            "**Blasting Safety Procedures:**\n\n"
            "1. **Only certified shot-firers** may handle explosives\n"
            "2. **Clear the blast zone** — minimum 300m for surface, follow shotfirer's instructions underground\n"
            "3. **Wait for the all-clear signal** before re-entering\n"
            "4. **Post-blast wait time:** minimum 30 minutes for fumes to clear\n"
            "5. **Check for misfires** — never approach a misfire. Report to the shotfirer\n"
            "6. **PPE:** Full hearing protection, respirator, flame-resistant clothing\n\n"
            "**Blasting schedule:** Check the daily notice board or this app's notifications for scheduled blasting times."
        ),
        "related": ["What PPE is required in blasting areas?", "What is the evacuation procedure?", "How do I report a misfire?"]
    },
    {
        "keywords": ["machine", "equipment", "vehicle", "loader", "truck", "conveyor", "drill"],
        "category": "Equipment & Machinery Safety",
        "answer": (
            "**Equipment Safety Guidelines:**\n\n"
            "1. **Pre-use inspection** — complete the equipment checklist before operation\n"
            "2. **Only trained operators** may use machinery\n"
            "3. **Seatbelts** must be worn in all vehicles\n"
            "4. **Maintain safe distances** from operating equipment\n"
            "5. **Lock-out/Tag-out** for any maintenance or repair\n"
            "6. **Report** any defects or malfunctions immediately\n\n"
            "**Conveyor belts:**\n"
            "- Never step on or over a moving conveyor\n"
            "- Use designated crossover bridges\n"
            "- Emergency pull-cords are located every 30m\n"
            "- Clear all loose clothing and jewelry before working near conveyors"
        ),
        "related": ["How do I complete an equipment inspection?", "How do I report damaged equipment?", "What PPE is required?"]
    },
    {
        "keywords": ["emergency", "sos", "help", "panic", "danger", "rescue"],
        "category": "Emergency Response",
        "answer": (
            "**How to Trigger an Emergency SOS:**\n\n"
            "1. **In this app:** Tap the large red SOS button on your dashboard\n"
            "2. Your **Worker ID**, **location**, and **timestamp** are automatically sent to all supervisors\n"
            "3. **Emergency contacts** will be notified\n"
            "4. **Stay calm** and stay where you are if safe to do so\n"
            "5. If you need to move, follow the evacuation route\n\n"
            "**The SOS system will:**\n"
            "- Alert all supervisors via the SOS Center\n"
            "- Send your GPS coordinates\n"
            "- Create a notification record\n"
            "- Dispatch rescue team if needed\n\n"
            "**Do NOT cancel** the SOS unless you are confirmed safe."
        ),
        "related": ["What is the evacuation procedure?", "Where is the nearest refuge chamber?", "How do I contact my supervisor?"]
    },
]


def find_best_answer(question: str) -> dict:
    """Find the best matching answer from the knowledge base"""
    question_lower = question.lower().strip()
    best_match = None
    best_score = 0

    for entry in KNOWLEDGE_BASE:
        score = 0
        for keyword in entry["keywords"]:
            if keyword in question_lower:
                # Longer keywords get higher scores for more specific matches
                score += len(keyword.split())

        if score > best_score:
            best_score = score
            best_match = entry

    if best_match and best_score > 0:
        return {
            "question": question,
            "answer": best_match["answer"],
            "category": best_match["category"],
            "related_questions": best_match.get("related", [])
        }

    return {
        "question": question,
        "answer": (
            "I don't have a specific answer for that question. Here are some things I can help with:\n\n"
            "- Gas detection and response\n"
            "- Evacuation procedures\n"
            "- Roof and ground stability\n"
            "- PPE requirements\n"
            "- First aid procedures\n"
            "- Incident reporting\n"
            "- Ventilation and air quality\n"
            "- Fatigue management\n"
            "- Electrical safety\n"
            "- Water hazards\n"
            "- Blasting safety\n"
            "- Equipment and machinery safety\n"
            "- Emergency SOS procedures\n\n"
            "Try asking something like 'What should I do if I smell gas?' or 'What PPE is required in blasting areas?'"
        ),
        "category": "General",
        "related_questions": [
            "What should I do if I smell gas?",
            "What is the evacuation procedure?",
            "What PPE is required in blasting areas?",
            "How do I report a hazard?"
        ]
    }


@router.post("/ask")
def ask_ai_assistant(
    payload: AIQuestion,
    user: User = Depends(require_any_role)
):
    """Ask the AI Safety Assistant a question about mining safety"""
    lang = payload.language or "en"
    
    # 1. Try Gemini generation if API key is configured
    if api_key:
        try:
            prompt = f"""
            You are an expert mine safety AI assistant. A mine worker is asking you a safety or emergency question.
            Question: "{payload.question}"
            
            Provide a clear, practical, and action-oriented answer in the preferred language: {lang}.
            Ensure the tone is professional, reassuring, and safety-focused.
            Keep the response relatively concise (1-3 brief paragraphs).
            If the question is not related to mining safety, hazards, health, or emergency response, politely guide the worker back to safety-related questions.
            """
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return {
                "question": payload.question,
                "answer": response.text,
                "category": "AI Safety Advisor",
                "related_questions": []
            }
        except Exception as e:
            print("Gemini generation failed, falling back to local KB:", e)
            
    # 2. Fallback to keyword-based answering
    result = find_best_answer(payload.question)
    
    # Translate fallback answer if language is not English and Gemini is available
    if lang != "en" and api_key:
        try:
            prompt = f"""
            Translate the following safety instruction text into the preferred language: {lang}.
            Keep any markdown formatting intact.
            
            Text:
            {result['answer']}
            """
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            result["answer"] = response.text
            result["category"] = f"{result['category']} ({lang.upper()})"
        except Exception as e:
            print("Fallback translation failed:", e)
            
    return result


@router.get("/suggested-questions")
def get_suggested_questions(
    user: User = Depends(require_any_role)
):
    """Get a list of suggested questions"""
    return {
        "questions": [
            "What should I do if I smell gas?",
            "What is the evacuation procedure?",
            "How do I report a roof crack?",
            "What PPE is required in blasting areas?",
            "How do I trigger an emergency SOS?",
            "What are the first aid steps for bleeding?",
            "How do I manage fatigue during a long shift?",
            "What are the signs of poor ventilation?",
            "How do I report a hazard?",
            "What should I do during a blasting operation?",
            "How do I handle electrical hazards?",
            "What should I do if water is flooding the area?"
        ]
    }
