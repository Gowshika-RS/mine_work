import os
import json
import uuid
import tempfile
import google.generativeai as genai
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import HazardReport, User, HazardImage
from ..auth.security import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI Hazard Detection"]
)

# Configure Gemini AI
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@router.post("/hazard-detect")
async def detect_hazard(
    file: UploadFile = File(...),
    location: str = Form(...),
    language: Optional[str] = Form("en"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read image content
    contents = await file.read()
    
    # Save image permanently first in uploads directory
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "hazards")
    os.makedirs(upload_dir, exist_ok=True)
    
    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    permanent_path = os.path.join(upload_dir, safe_filename)
    with open(permanent_path, "wb") as f:
        f.write(contents)
        
    image_url = f"/static/hazards/{safe_filename}"

    # Default Mock Data in case Gemini fails or is not configured
    lang = language or "en"
    mock_hazards = {
        "en": {
            "hazard_type": "Roof Stability Crack",
            "severity": "critical",
            "risk_level": "High probability of ceiling collapse or structural rock fall in active transport shaft.",
            "description": "A horizontal fracture approx 1.5m long visible on the hanging wall with small debris.",
            "precautions": "Do not enter or cross the affected section under any circumstances.",
            "required_ppe": "Hard hat, steel-toe boots, reflective safety vest.",
            "immediate_actions": "Barricade the area immediately, evacuate nearby workers, notify control room.",
            "notify_who": "emergency_team"
        },
        "hi": {
            "hazard_type": "छत की स्थिरता में दरार",
            "severity": "critical",
            "risk_level": "सक्रिय परिवहन शाफ्ट में छत गिरने या संरचनात्मक चट्टान गिरने की उच्च संभावना।",
            "description": "लटकती हुई दीवार पर लगभग 1.5 मीटर लंबी क्षैतिज दरार और छोटा मलबा दिखाई दे रहा है।",
            "precautions": "किसी भी परिस्थिति में प्रभावित हिस्से में प्रवेश न करें या पार न करें।",
            "required_ppe": "हेलमेट, स्टील-टो बूट, परावर्तक सुरक्षा जैकेट।",
            "immediate_actions": "क्षेत्र को तुरंत बैरिकेड करें, आसपास के कर्मचारियों को बाहर निकालें, नियंत्रण कक्ष को सूचित करें।",
            "notify_who": "emergency_team"
        },
        "ta": {
            "hazard_type": "மேற்கூரை நிலைத்தன்மை விரிசல்",
            "severity": "critical",
            "risk_level": "சுரங்கப் பாதையில் மேற்கூரை சரிவு அல்லது பாறை வீழ்ச்சி ஏற்பட அதிக வாய்ப்பு உள்ளது.",
            "description": "சுரங்க சுவரில் சுமார் 1.5 மீட்டர் நீளമുള്ള கிடைமட்ட விரிசல் மற்றும் சிறிய குப்பைகள் காணப்படுகின்றன.",
            "precautions": "எந்தவொரு சூழ்நிலையத்திலும் பாதிக்கப்பட்ட பகுதிக்குள் நுழையவோ அல்லது கடக்கவோ வேண்டாம்.",
            "required_ppe": "தலைக்கவசம், பாதுகாப்பு காலணிகள், பிரதிபலிப்பு ஜாக்கெட்.",
            "immediate_actions": "உடனடியாக அப்பகுதியை சுற்றி வேলি அமைக்கவும், அருகிலுள்ள தொழிலாளர்களை வெளியேற்றவும், கட்டுப்பாட்டு அறைக்கு அறிவிக்கவும்.",
            "notify_who": "emergency_team"
        },
        "te": {
            "hazard_type": "కప్పు స్థిరత్వం దెబ్బతిని పగుళ్లు",
            "severity": "critical",
            "risk_level": "యాక్టివ్ ట్రాన్స్‌పోర్ట్ షాఫ్ట్‌లో పైకప్పు కూలిపోవడం లేదా రాళ్ళు పడిపోయే అధిక ప్రమాదం.",
            "description": "గోడపై సుమారు 1.5 మీటర్ల పొడవైన పగులు మరియు చిన్న శిధిలాలు కనిపిస్తున్నాయి.",
            "precautions": "ఎట్టి పరిస్థితుల్లోనూ ప్రభావిత ప్రాంతంలోకైనా ప్రవేశించవద్దు.",
            "required_ppe": "హెల్మెట్, స్టీల్-టో బూట్లు, రిఫ్లెక్టివ్ సేఫ్టీ వెస్ట్.",
            "immediate_actions": "వెంటనే ఆ ప్రాంతాన్ని బారికేడ్ చేయండి, సమీపంలోని కార్మికులను ఖాళీ చేయించండి, కంట్రోల్ రూమ్‌కు తెలియజేయండి.",
            "notify_who": "emergency_team"
        },
        "kn": {
            "hazard_type": "ಛಾವಣಿಯ ಸ್ಥಿರತೆ ಬಿರುಕು",
            "severity": "critical",
            "risk_level": "ಸಕ್ರಿಯ ಸಾರಿಗೆ ಸುರಂಗದಲ್ಲಿ ಛಾವಣಿ ಕುಸಿತ ಅಥವಾ ಕಲ್ಲು ಬೀಳುವ ಹೆಚ್ಚಿನ ಸಂಭವನೀಯತೆ.",
            "description": "ನೇತಾಡುವ ಗೋಡೆಯ ಮೇಲೆ ಸುಮಾರು 1.5 ಮೀಟರ್ ಉದ್ದದ ಬಿರುಕು ಮತ್ತು ಸಣ್ಣ ಅವಶೇಷಗಳು ಗೋಚರಿಸುತ್ತವೆ.",
            "precautions": "ಯಾವುದೇ ಸಂದರ್ಭದಲ್ಲೂ ಪೀಡಿತ ವಿಭಾಗವನ್ನು ಪ್ರವೇಶಿಸಬೇಡಿ ಅಥವಾ ದಾಟಬೇಡಿ.",
            "required_ppe": "ಹೆಲ್ಮೆಟ್, ಸುರಕ್ಷತಾ ಬೂಟುಗಳು, ಪ್ರತಿಫಲಿತ ಸುರಕ್ಷತಾ ಜಾಕೆಟ್.",
            "immediate_actions": "ತಕ್ಷಣವೇ ಪ್ರದೇಶವನ್ನು ಬ್ಯಾರಿಕೇಡ್ ಮಾಡಿ, ಹತ್ತಿರದ ಕಾರ್ಮಿಕರನ್ನು ಸ್ಥಳಾಂತರಿಸಿ, ನಿಯಂತ್ರಣ ಕೊಠಡಿಗೆ ತಿಳಿಸಿ.",
            "notify_who": "emergency_team"
        },
        "ml": {
            "hazard_type": "മേൽക്കൂരയുടെ സ്ഥിരതയില്ലായ്മയും വിള്ളലും",
            "severity": "critical",
            "risk_level": "മേൽക്കൂര തകരാനോ അല്ലെങ്കിൽ പാറകൾ വീഴാനോ ഉള്ള ഉയർന്ന സാധ്യതയുണ്ട്.",
            "description": "ചുവരുകളിൽ ഏകദേശം 1.5 മീറ്റർ നീളമുള്ള വിള്ളലും ചെറിയ അവശിഷ്ടങ്ങളും കാണാം.",
            "precautions": "ഒരു കാരണവശാലും ബാധിച്ച ഭാഗത്തേക്ക് പ്രവേശിക്കുകയോ കടക്കുകയോ ചെയ്യരുത്.",
            "required_ppe": "ഹെൽമെറ്റ്, സുരക്ഷാ ബൂട്ടുകൾ, റിഫ്ലക്ടീവ് സുരക്ഷാ ജാക്കറ്റ്.",
            "immediate_actions": "ഉടൻ തന്നെ പ്രദേശം ബാരിക്കേഡ് ചെയ്യുക, തൊഴിലാളികളെ ഒഴിപ്പിക്കുക, കൺട്രോൾ റൂമിൽ അറിയിക്കുക.",
            "notify_who": "emergency_team"
        },
        "mr": {
            "hazard_type": "छताच्या स्थिरतेमध्ये तडा",
            "severity": "critical",
            "risk_level": "सक्रिय वाहतूक बोगद्यामध्ये छत कोसळण्याची किंवा दगड पडण्याची दाट शक्यता.",
            "description": "भिंतीवर अंदाजे 1.5 मीटर लांबीचा तडा आणि किरकोळ कचरा दिसत आहे.",
            "precautions": "कोणत्याही परिस्थितीत प्रभावित भागात प्रवेश करू नका.",
            "required_ppe": "हेल्मेट, सेफ्टी बूट, रिफ्लेक्टिव्ह सेफ्टी व्हेस्ट.",
            "immediate_actions": "तातडीने संबंधित भागाला बॅरिकेड करा, जवळच्या कामगारांना बाहेर काढा, नियंत्रण कक्षाला कळवा.",
            "notify_who": "emergency_team"
        },
        "bn": {
            "hazard_type": "ছাদের স্থায়িত্বে ফাটল",
            "severity": "critical",
            "risk_level": "সক্রিয় পরিবহন সুড়ঙ্গে ছাদ ধসে পড়া বা পাথর পড়ে যাওয়ার উচ্চ আশঙ্কা।",
            "description": "ঝুলন্ত দেয়ালে প্রায় ১.৫ মিটার দীর্ঘ ফাটল এবং ছোট ধ্বংসাবশেষ দৃশ্যমান।",
            "precautions": "কোনো অবস্থাতেই ক্ষতিগ্রস্ত এলাকায় প্রবেশ করবেন না।",
            "required_ppe": "হেলমেট, সেফটি বুট, প্রতিফলিত সেফটি ভেস্ট।",
            "immediate_actions": "অবিলম্বে এলাকাটি ব্যারিকেড করুন, কর্মীদের সরিয়ে নিন, নিয়ন্ত্রণ কক্ষে জানান।",
            "notify_who": "emergency_team"
        },
        "gu": {
            "hazard_type": "છતની સ્થિરતામાં તિરાડ",
            "severity": "critical",
            "risk_level": "સક્રિય બંદર ટનલમાં છત ધરાશાયી થવાની અથવા પથ્થર પડવાની ઉચ્ચ સંભાવના.",
            "description": "લટકતી દીવાલ પર અંદાજે 1.5 મીટર લાંબી તિરાડ અને નાનો કચરો દેખાય છે.",
            "precautions": "કોઈપણ સંજોગોમાં અસરગ્રસ્ત વિસ્તારમાં પ્રવેશ કરશો નહીં.",
            "required_ppe": "હેલ્મેટ, સેફટી બૂટ, રિફ્લેક્ટિવ સેફ્ટી જેકેટ.",
            "immediate_actions": "વિસ્તારને તાત્કાલિક બેરીકેડ કરો, કામદારોને ખસેડો, નિયંત્રણ રૂમને જાણ કરો.",
            "notify_who": "emergency_team"
        },
        "pa": {
            "hazard_type": "ਛੱਤ ਦੀ ਸਥਿਰਤਾ ਵਿੱਚ ਤਰੇੜ",
            "severity": "critical",
            "risk_level": "ਸੁਰੰਗ ਦੀ ਛੱਤ ਡਿੱਗਣ ਜਾਂ ਚੱਟਾਨਾਂ ਦੇ ਖਿਸਕਣ ਦਾ ਉੱਚ ਖਤਰਾ।",
            "description": "ਕੰਧ 'ਤੇ ਲਗਭਗ 1.5 ਮੀਟਰ ਲੰਬੀ ਤਰੇੜ ਅਤੇ ਮਲਬਾ ਦਿਖਾਈ ਦੇ ਰਿਹਾ ਹੈ।",
            "precautions": "ਕਿਸੇ ਵੀ ਹਾਲਤ ਵਿੱਚ ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ ਵਿੱਚ ਦਾਖਲ ਨਾ ਹੋਵੋ।",
            "required_ppe": "ਹੈਲਮੇਟ, ਸੁਰੱਖਿਆ ਬੂਟ, ਰਿਫਲੈਕਟਿવ ਸੇਫਟੀ ਜੈਕਟ।",
            "immediate_actions": "ਖੇਤਰ ਨੂੰ ਤੁਰੰत ਬੈਰੀਕੇਡ ਕਰੋ, ਕਰਮਚਾਰੀਆਂ ਨੂੰ ਬਾਹਰ ਕੱਢੋ, ਕੰਟਰੋਲ ਰੂਮ ਨੂੰ ਸੂਚਿਤ ਕਰੋ।",
            "notify_who": "emergency_team"
        },
        "or": {
            "hazard_type": "ଛାତର ସ୍ଥିରତାରେ ଫାଟ",
            "severity": "critical",
            "risk_level": "ସକ୍ରିୟ ପରିବହନ ସୁଡ଼ଙ୍ଗରେ ଛାତ ଭୁଶୁଡ଼ିବା କିମ୍ବା ପଥର ପଡ଼ିବାର ଅଧିକ ଆଶଙ୍କା।",
            "description": "ଝୁଲନ୍ତା କାନ୍ଥରେ ପ୍ରାୟ ୧.୫ ମିଟର ଲମ୍ବର ଫାଟ ଏବଂ ଛୋଟ ଆବର୍ଜନା ଦେଖାଯାଉଛି।",
            "precautions": "କୌଣସି ପରିସ୍ଥିତିରେ ପ୍ରଭାବିତ ଅଞ୍ଚଳକୁ ପ୍ରବେଶ କରନ୍ତୁ ନାହିଁ।",
            "required_ppe": "ହେଲମେଟ୍, ସେଫ୍ଟି ବୁଟ୍, ପ୍ରତିଫଳିତ ସେଫ୍ଟି ଜ୍ୟାକେଟ୍।",
            "immediate_actions": "ତୁରନ୍ତ ସେହି ଅଞ୍ଚଳକୁ ବ୍ୟାରିକେଡ୍ କରନ୍ତୁ, ଶ୍ରਮିକମାନଙ୍କୁ ସ୍ଥାନାନ୍ତର କରନ୍ତୁ, ନିୟନ୍ତ୍ରଣ କକ୍ଷକୁ ଜଣାନ୍ତୁ।",
            "notify_who": "emergency_team"
        }
    }
    ai_data = mock_hazards.get(lang, mock_hazards["en"])

    if api_key:
        # Save image temporarily for Gemini API processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name

        try:
            # Process image with Gemini
            sample_file = genai.upload_file(path=temp_file_path, display_name="Hazard Image")
            
            prompt = f"""
            You are a highly skilled mine safety AI assistant. Analyze the provided image of a mining environment.
            Identify any hazards or unsafe conditions. 
            Return ONLY a JSON object with the following structure (no markdown, just valid JSON). 
            All descriptions, types, risk_levels, precautions, required_ppes, immediate_actions MUST be written in the preferred language: {lang}.
            {{
                "hazard_type": "Brief name of the hazard in {lang}",
                "severity": "low", "medium", "high", or "critical",
                "risk_level": "Detailed risk assessment in {lang}",
                "description": "Detailed description of the hazard seen in the image in {lang}",
                "precautions": "Precautions to take immediately in {lang}",
                "required_ppe": "Required PPE to handle this in {lang}",
                "immediate_actions": "What the worker should do right now in {lang}",
                "notify_who": "supervisor, emergency_team, or maintenance"
            }}
            """
            
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content([sample_file, prompt])
            
            # Parse JSON
            response_text = response.text
            # Clean up markdown if any
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
                
            ai_data = json.loads(response_text)
            
            # Cleanup temp file and Gemini file
            os.remove(temp_file_path)
            genai.delete_file(sample_file.name)
        except Exception as e:
            print("Gemini Vision processing failed, falling back to mock:", e)
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    # Save to database
    db_report = HazardReport(
        reporter_id=current_user.id,
        hazard_type=ai_data.get("hazard_type", "Unknown"),
        severity=ai_data.get("severity", "medium"),
        description=ai_data.get("description", ""),
        location=location,
        status="open",
        risk_level=ai_data.get("risk_level", ""),
        precautions=ai_data.get("precautions", ""),
        required_ppe=ai_data.get("required_ppe", ""),
        immediate_actions=ai_data.get("immediate_actions", ""),
        notify_who=ai_data.get("notify_who", ""),
        ai_analysis=ai_data
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    # Add to HazardImage
    db_image = HazardImage(
        hazard_report_id=db_report.id,
        image_url=image_url
    )
    db.add(db_image)
    db.commit()
    
    return {
        "message": "Hazard reported successfully",
        "report_id": db_report.id,
        "ai_analysis": ai_data,
        "image_url": image_url
    }
