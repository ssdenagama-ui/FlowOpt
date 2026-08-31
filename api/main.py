from fastapi import (
    FastAPI, HTTPException,
    Depends, status
)
from fastapi.middleware.cors import (
    CORSMiddleware)
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
import joblib
import os

from api.database import (
    get_db, init_db, User,
    HospitalData)
from api.auth import (
    hash_password, verify_password)

# ── App setup ─────────────────────────
app = FastAPI(
    title="FlowOpt API",
    version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"])

# ── Load ML models ────────────────────
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)))
MODELS_DIR = os.path.join(
    BASE_DIR, "models")

def load_model(filename):
    path = os.path.join(
        MODELS_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Model not found: {path}")
    return joblib.load(path)

try:
    admission_model = load_model(
        "admission_model.pkl")
    bed_model       = load_model(
        "bed_model.pkl")
    los_model       = load_model(
        "los_model.pkl")
    opd_model       = load_model(
        "opd_model.pkl")
    discharge_model = load_model(
        "discharge_model.pkl")
    print("✅ All 5 models loaded!")
except Exception as e:
    print(f"❌ Error loading models: {e}")

# ── Default data ──────────────────────
INITIAL_HOSPITAL_DATA = [
    {"year":2013,"inpat":5926125,
     "bor":72.1,"ados":3.9,
     "opd":19635994,"disc":5881886,
     "death_t":44239,"beds":83275},
    {"year":2014,"inpat":6120470,
     "bor":72.5,"ados":3.7,
     "opd":21000000,"disc":6073053,
     "death_t":47417,"beds":84728},
    {"year":2015,"inpat":6359681,
     "bor":73.2,"ados":3.6,
     "opd":22500000,"disc":6311873,
     "death_t":47808,"beds":84728},
    {"year":2016,"inpat":6497773,
     "bor":74.1,"ados":3.6,
     "opd":24000000,"disc":6449753,
     "death_t":48020,"beds":86589},
    {"year":2017,"inpat":6910249,
     "bor":75.0,"ados":3.5,
     "opd":26094945,"disc":6857911,
     "death_t":52338,"beds":86589},
    {"year":2018,"inpat":7116268,
     "bor":76.2,"ados":3.5,
     "opd":27858203,"disc":7063097,
     "death_t":53171,"beds":87280},
    {"year":2019,"inpat":7477860,
     "bor":77.1,"ados":3.5,
     "opd":31545497,"disc":7418884,
     "death_t":58976,"beds":87280},
    {"year":2020,"inpat":5785147,
     "bor":48.4,"ados":3.1,
     "opd":23402668,"disc":5737317,
     "death_t":47830,"beds":87280},
    {"year":2021,"inpat":5314193,
     "bor":60.2,"ados":3.3,
     "opd":26094945,"disc":5250335,
     "death_t":63858,"beds":88500},
    {"year":2022,"inpat":6350347,
     "bor":68.5,"ados":3.4,
     "opd":28000000,"disc":6283849,
     "death_t":66498,"beds":89500},
    {"year":2023,"inpat":6949732,
     "bor":71.0,"ados":3.4,
     "opd":29844925,"disc":6882377,
     "death_t":67355,"beds":90500},
    {"year":2024,"inpat":7194899,
     "bor":72.5,"ados":3.3,
     "opd":31000000,"disc":7126598,
     "death_t":68301,"beds":91159},
]

DEFAULT_USERS = [
    {"username":"admin",
     "password":"flowopt2025",
     "name":"Hospital Administrator",
     "email":"admin@flowopt.lk",
     "role":"admin"},
    {"username":"viewer",
     "password":"view123",
     "name":"Ward Manager",
     "email":"ward@flowopt.lk",
     "role":"viewer"},
]

@app.on_event("startup")
async def startup_event():
    init_db()
    db = next(get_db())

    # Seed default users
    for u in DEFAULT_USERS:
        existing = db.query(User).filter(
            User.username==u["username"]
        ).first()
        if not existing:
            db.add(User(
                username=u["username"],
                password=hash_password(
                    u["password"]),
                name=u["name"],
                email=u["email"],
                role=u["role"],
            ))
    db.commit()

    # Seed hospital data
    for d in INITIAL_HOSPITAL_DATA:
        existing = db.query(
            HospitalData).filter(
            HospitalData.year==d["year"]
        ).first()
        if not existing:
            db.add(HospitalData(**d,
                added_by="system"))
    db.commit()
    print("✅ Database initialised!")

# ── Pydantic schemas ──────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    name:     str
    email:    Optional[str] = ''
    role:     str = 'viewer'

class UserUpdate(BaseModel):
    password: Optional[str] = None
    name:     Optional[str] = None
    email:    Optional[str] = None
    role:     Optional[str] = None

class HospitalDataCreate(BaseModel):
    year:    int
    inpat:   float
    disc:    float
    death_t: float
    bor:     float
    ados:    float
    opd:     float
    beds:    float
    added_by:Optional[str] = 'admin'

class AdmissionInput(BaseModel):
    disc_t:       float
    death_t:      float
    inpat_lag1:   float
    disc_t_lag1:  float
    death_t_lag1: float
    growth:       float
    covid:        int

class BedInput(BaseModel):
    beds:      float
    bor_lag1:  float
    beds_lag1: float
    growth:    float
    covid:     int

class LOSInput(BaseModel):
    bor:       float
    ados_lag1: float
    bor_lag1:  float
    growth:    float
    covid:     int

class OPDInput(BaseModel):
    opd_lag1: float
    growth:   float
    covid:    int

class DischargeInput(BaseModel):
    inpat:        float
    death_t:      float
    disc_t_lag1:  float
    inpat_lag1:   float
    death_t_lag1: float
    growth:       float
    covid:        int

# ── Auth routes ───────────────────────

@app.post("/auth/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username==
            data.username.lower().strip()
    ).first()
    if not user or not verify_password(
        data.password, user.password):
        raise HTTPException(
            status_code=status.
                HTTP_401_UNAUTHORIZED,
            detail=
                "Invalid username "
                "or password")
    return {
        "id":       user.id,
        "username": user.username,
        "name":     user.name,
        "email":    user.email,
        "role":     user.role,
    }

# ── User routes ───────────────────────

@app.get("/users")
def get_users(
    db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{
        "id":       u.id,
        "username": u.username,
        "name":     u.name,
        "email":    u.email,
        "role":     u.role,
    } for u in users]

@app.post("/users",
    status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        User.username==
            data.username.lower().strip()
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=
                "Username already exists")
    user = User(
        username=
            data.username.lower().strip(),
        password=hash_password(
            data.password),
        name=data.name,
        email=data.email or '',
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "id":       user.id,
        "username": user.username,
        "name":     user.name,
        "email":    user.email,
        "role":     user.role,
        "message":
            f"User '{user.username}' "
            f"created successfully",
    }

@app.put("/users/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.id==user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found")
    if data.password:
        user.password = hash_password(
            data.password)
    if data.name:
        user.name = data.name
    if data.email is not None:
        user.email = data.email
    if data.role:
        user.role = data.role
    db.commit()
    db.refresh(user)
    return {
        "id":       user.id,
        "username": user.username,
        "name":     user.name,
        "email":    user.email,
        "role":     user.role,
        "message":
            f"User '{user.username}' "
            f"updated successfully",
    }

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.id==user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found")
    # Check last admin
    if user.role == 'admin':
        admin_count = db.query(User)\
            .filter(
                User.role=='admin',
                User.id!=user_id
            ).count()
        if admin_count == 0:
            raise HTTPException(
                status_code=400,
                detail=
                    "Cannot delete "
                    "the last admin")
    db.delete(user)
    db.commit()
    return {
        "message":
            f"User '{user.username}' "
            f"deleted successfully"}

@app.delete("/hospital-data/{year}")
def delete_hospital_data(
    year: int,
    db: Session = Depends(get_db)):
    record = db.query(HospitalData).filter(
        HospitalData.year == year
    ).first()
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for year {year}")
    if record.added_by == "system":
        raise HTTPException(
            status_code=400,
            detail=
                f"Cannot delete {year} — "
                f"this is original "
                f"Ministry of Health data")
    db.delete(record)
    db.commit()
    return {
        "message":
            f"Year {year} data "
            f"deleted successfully"}

# ── Hospital data routes ──────────────

@app.get("/hospital-data")
def get_hospital_data(
    db: Session = Depends(get_db)):
    data = db.query(HospitalData)\
        .order_by(HospitalData.year)\
        .all()
    return [{
        "year":     d.year,
        "inpat":    d.inpat,
        "disc":     d.disc,
        "death_t":  d.death_t,
        "bor":      d.bor,
        "ados":     d.ados,
        "opd":      d.opd,
        "beds":     d.beds,
        "added_by": d.added_by,
    } for d in data]

@app.post("/hospital-data",
    status_code=status.HTTP_201_CREATED)
def add_hospital_data(
    data: HospitalDataCreate,
    db: Session = Depends(get_db)):
    existing = db.query(
        HospitalData).filter(
        HospitalData.year==data.year
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=
                f"Data for year "
                f"{data.year} already "
                f"exists")
    record = HospitalData(
        year=    data.year,
        inpat=   data.inpat,
        disc=    data.disc,
        death_t= data.death_t,
        bor=     data.bor,
        ados=    data.ados,
        opd=     data.opd,
        beds=    data.beds,
        added_by=data.added_by
            or 'admin',
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "year":    record.year,
        "inpat":   record.inpat,
        "disc":    record.disc,
        "death_t": record.death_t,
        "bor":     record.bor,
        "ados":    record.ados,
        "opd":     record.opd,
        "beds":    record.beds,
        "added_by":record.added_by,
        "message":
            f"Year {record.year} data "
            f"saved successfully",
    }

# ── System routes ─────────────────────

@app.get("/")
def home():
    return {
        "system":  "FlowOpt",
        "version": "2.0.0",
        "status":  "running",
        "database":"SQLite",
    }

@app.get("/health")
def health():
    return {
        "status":        "healthy",
        "models_loaded": 5,
        "database":      "SQLite",
        "data_source":
            "Sri Lanka Ministry of "
            "Health IMMR & AHB 2013-2024",
    }

@app.get("/summary")
def summary():
    return {
        "models": {
            "admission":
                {"r2":1.0000,
                 "algorithm":
                     "Linear Regression"},
            "bed_occupancy":
                {"r2":0.9997,
                 "algorithm":
                     "Linear Regression"},
            "length_of_stay":
                {"r2":0.9998,
                 "algorithm":
                     "Linear Regression"},
            "opd_attendance":
                {"r2":0.9988,
                 "algorithm":
                     "Linear Regression"},
            "discharge_volume":
                {"r2":1.0000,
                 "algorithm":
                     "Linear Regression"},
        }
    }

# ── Prediction routes ─────────────────

@app.post("/predict/admissions")
def predict_admissions(
    data: AdmissionInput):
    try:
        features = [[
            data.disc_t,
            data.death_t,
            data.inpat_lag1,
            data.disc_t_lag1,
            data.death_t_lag1,
            data.growth,
            data.covid,
        ]]
        pred = float(
            admission_model
                .predict(features)[0])
        return {
            "prediction_task":
                "Total Inpatient "
                "Admissions",
            "predicted_value":
                round(pred),
            "unit":
                "patients per year",
            "high_demand_alert":
                bool(pred > 7500000),
            "alert_message":
                "⚠️ High admission "
                "volume predicted"
                if pred > 7500000
                else "✅ Normal admission"
                " volume predicted",
            "model_used":
                "Linear Regression",
            "r2_score": 1.0000,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e))

@app.post("/predict/bed-occupancy")
def predict_bed(data: BedInput):
    try:
        features = [[
            data.beds,
            data.bor_lag1,
            data.beds_lag1,
            data.growth,
            data.covid,
        ]]
        pred = float(
            bed_model.predict(
                features)[0])
        pred = max(0.0, min(100.0, pred))
        alert = bool(pred > 85)
        return {
            "prediction_task":
                "Bed Occupancy Rate",
            "predicted_value":
                round(pred, 2),
            "unit": "% occupancy",
            "high_demand_alert": alert,
            "alert_message":
                "🚨 CRITICAL — Bed "
                "occupancy above 85%!"
                if alert
                else "✅ Bed occupancy "
                "within normal range",
            "model_used":
                "Linear Regression",
            "r2_score": 0.9997,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e))

@app.post("/predict/length-of-stay")
def predict_los(data: LOSInput):
    try:
        features = [[
            data.bor,
            data.ados_lag1,
            data.bor_lag1,
            data.growth,
            data.covid,
        ]]
        pred = float(
            los_model.predict(
                features)[0])
        pred = max(1.0, pred)
        return {
            "prediction_task":
                "Average Length of Stay",
            "predicted_value":
                round(pred, 2),
            "unit": "days per admission",
            "high_demand_alert": False,
            "alert_message":
                f"Patients expected to "
                f"stay {round(pred,1)}"
                f" days on average",
            "model_used":
                "Linear Regression",
            "r2_score": 0.9998,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e))

@app.post("/predict/opd")
def predict_opd(data: OPDInput):
    try:
        features = [[
            data.opd_lag1,
            data.growth,
            data.covid,
        ]]
        pred = float(
            opd_model.predict(
                features)[0])
        pred = max(0.0, pred)
        alert = bool(pred > 30000000)
        return {
            "prediction_task":
                "OPD Attendance",
            "predicted_value":
                round(pred),
            "unit": "visits per year",
            "high_demand_alert": alert,
            "alert_message":
                "⚠️ Very high OPD "
                "demand predicted"
                if alert
                else "✅ Normal OPD "
                "demand predicted",
            "model_used":
                "Linear Regression",
            "r2_score": 0.9988,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e))

@app.post("/predict/discharges")
def predict_discharges(
    data: DischargeInput):
    try:
        features = [[
            data.inpat,
            data.death_t,
            data.disc_t_lag1,
            data.inpat_lag1,
            data.death_t_lag1,
            data.growth,
            data.covid,
        ]]
        pred = float(
            discharge_model.predict(
                features)[0])
        pred = max(0.0, pred)
        return {
            "prediction_task":
                "Discharge Volume",
            "predicted_value":
                round(pred),
            "unit":
                "patients per year",
            "high_demand_alert": False,
            "alert_message":
                f"Expected "
                f"{round(pred):,} "
                f"discharges this year",
            "model_used":
                "Linear Regression",
            "r2_score": 1.0000,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e))
