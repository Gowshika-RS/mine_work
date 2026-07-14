from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import TrainingModule, TrainingQuiz, TrainingProgress, User
from ..schemas import (
    TrainingModuleCreate, TrainingModuleOut,
    TrainingQuizCreate, TrainingQuizOut,
    QuizSubmission, TrainingProgressOut
)
from ..auth.security import require_admin, require_worker, require_any_role
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/training", tags=["Training & Knowledge Hub"])


# --- Training Modules ---

@router.get("/modules", response_model=List[TrainingModuleOut])
def list_training_modules(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """List all training modules, optionally filtered by category"""
    query = db.query(TrainingModule)
    if category:
        query = query.filter(TrainingModule.category == category)
    modules = query.order_by(TrainingModule.created_at.desc()).all()
    return modules


@router.get("/modules/{module_id}", response_model=TrainingModuleOut)
def get_training_module(
    module_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Get a single training module by ID"""
    module = db.query(TrainingModule).filter(TrainingModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Training module not found")
    return module


@router.post("/modules", response_model=TrainingModuleOut)
def create_training_module(
    payload: TrainingModuleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Create a new training module (admin only)"""
    module = TrainingModule(
        title=payload.title,
        category=payload.category,
        description=payload.description,
        content=payload.content,
        video_url=payload.video_url,
        duration_minutes=payload.duration_minutes,
        is_mandatory=payload.is_mandatory
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    log_audit(db, admin.id, "TRAINING_MODULE_CREATED", f"Module: {module.title}")
    return module


@router.put("/modules/{module_id}", response_model=TrainingModuleOut)
def update_training_module(
    module_id: int,
    payload: TrainingModuleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Update a training module (admin only)"""
    module = db.query(TrainingModule).filter(TrainingModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Training module not found")

    module.title = payload.title
    module.category = payload.category
    module.description = payload.description
    module.content = payload.content
    module.video_url = payload.video_url
    module.duration_minutes = payload.duration_minutes
    module.is_mandatory = payload.is_mandatory

    db.commit()
    db.refresh(module)
    log_audit(db, admin.id, "TRAINING_MODULE_UPDATED", f"Module ID: {module_id}")
    return module


@router.delete("/modules/{module_id}")
def delete_training_module(
    module_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Delete a training module (admin only)"""
    module = db.query(TrainingModule).filter(TrainingModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Training module not found")

    db.delete(module)
    db.commit()
    log_audit(db, admin.id, "TRAINING_MODULE_DELETED", f"Module: {module.title}")
    return {"message": "Training module deleted successfully"}


# --- Quizzes ---

@router.get("/modules/{module_id}/quizzes", response_model=List[TrainingQuizOut])
def get_module_quizzes(
    module_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Get all quizzes for a training module"""
    quizzes = db.query(TrainingQuiz).filter(TrainingQuiz.module_id == module_id).all()
    return quizzes


@router.post("/quizzes", response_model=TrainingQuizOut)
def create_quiz(
    payload: TrainingQuizCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Create a quiz question for a module (admin only)"""
    module = db.query(TrainingModule).filter(TrainingModule.id == payload.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Training module not found")

    quiz = TrainingQuiz(
        module_id=payload.module_id,
        question=payload.question,
        options=payload.options,
        correct_answer=payload.correct_answer
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


@router.post("/quizzes/{module_id}/submit")
def submit_quiz(
    module_id: int,
    submission: QuizSubmission,
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Submit quiz answers and calculate score"""
    quizzes = db.query(TrainingQuiz).filter(TrainingQuiz.module_id == module_id).all()
    if not quizzes:
        raise HTTPException(status_code=404, detail="No quizzes found for this module")

    if len(submission.answers) != len(quizzes):
        raise HTTPException(
            status_code=400,
            detail=f"Expected {len(quizzes)} answers, got {len(submission.answers)}"
        )

    correct = sum(1 for q, a in zip(quizzes, submission.answers) if q.correct_answer == a)
    score = int((correct / len(quizzes)) * 100)
    passed = score >= 70

    # Update or create progress
    progress = db.query(TrainingProgress).filter(
        TrainingProgress.worker_id == worker.id,
        TrainingProgress.module_id == module_id
    ).first()

    if progress:
        progress.quiz_score = score
        progress.completed = passed
        if passed:
            progress.completed_at = datetime.utcnow()
    else:
        progress = TrainingProgress(
            worker_id=worker.id,
            module_id=module_id,
            quiz_score=score,
            completed=passed,
            completed_at=datetime.utcnow() if passed else None
        )
        db.add(progress)

    db.commit()
    db.refresh(progress)

    return {
        "score": score,
        "correct": correct,
        "total": len(quizzes),
        "passed": passed,
        "message": "Congratulations! Module completed." if passed else "Score below 70%. Please review and try again."
    }


# --- Progress Tracking ---

@router.get("/progress", response_model=List[TrainingProgressOut])
def get_my_progress(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get worker's own training progress"""
    progress = db.query(TrainingProgress).filter(
        TrainingProgress.worker_id == worker.id
    ).all()
    return progress


@router.get("/progress/all")
def get_all_progress(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all workers' training progress (admin only)"""
    workers = db.query(User).filter(User.role == "worker").all()
    modules = db.query(TrainingModule).all()
    total_modules = len(modules)
    mandatory_modules = len([m for m in modules if m.is_mandatory])

    result = []
    for worker in workers:
        progress_records = db.query(TrainingProgress).filter(
            TrainingProgress.worker_id == worker.id
        ).all()

        completed = len([p for p in progress_records if p.completed])
        mandatory_completed = 0
        for p in progress_records:
            if p.completed:
                mod = next((m for m in modules if m.id == p.module_id), None)
                if mod and mod.is_mandatory:
                    mandatory_completed += 1

        avg_score = 0
        scored = [p.quiz_score for p in progress_records if p.quiz_score is not None]
        if scored:
            avg_score = sum(scored) / len(scored)

        result.append({
            "worker_id": worker.id,
            "username": worker.username,
            "name": worker.profile.full_name if worker.profile else worker.username,
            "total_modules": total_modules,
            "completed": completed,
            "mandatory_total": mandatory_modules,
            "mandatory_completed": mandatory_completed,
            "average_score": round(avg_score, 1),
            "completion_rate": round((completed / total_modules * 100) if total_modules > 0 else 0, 1)
        })

    return result


@router.post("/progress/{module_id}/mark-read")
def mark_module_read(
    module_id: int,
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Mark a training module as read (without quiz completion)"""
    module = db.query(TrainingModule).filter(TrainingModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Training module not found")

    progress = db.query(TrainingProgress).filter(
        TrainingProgress.worker_id == worker.id,
        TrainingProgress.module_id == module_id
    ).first()

    if not progress:
        progress = TrainingProgress(
            worker_id=worker.id,
            module_id=module_id,
            completed=False
        )
        db.add(progress)
        db.commit()

    return {"message": "Module marked as read"}
