from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta, timezone
from models import db, User, Prediction
from auth import require_auth, require_admin, get_current_user

analytics_bp = Blueprint('analytics', __name__, url_prefix='/analytics')

def get_time_filter(time_range):
    """Get date filter based on time range"""
    now = datetime.now(timezone.utc)
    if time_range == '7d':
        return now - timedelta(days=7)
    elif time_range == '30d':
        return now - timedelta(days=30)
    elif time_range == '90d':
        return now - timedelta(days=90)
    else:  # 'all'
        return None

@analytics_bp.route('/', methods=['GET'])
def get_analytics():
    """Comprehensive analytics endpoint for dashboard"""
    try:
        time_range = request.args.get('time_range', '7d')
        start_date = get_time_filter(time_range)
        
        # Base query
        query = Prediction.query
        if start_date:
            query = query.filter(Prediction.created_at >= start_date)
        
        # Total analyses
        total_analyses = query.count()
        
        if total_analyses == 0:
            return jsonify({
                'total_analyses': 0,
                'average_confidence': 0,
                'high_confidence_count': 0,
                'unique_diseases': [],
                'disease_distribution': [],
                'confidence_distribution': [],
                'recent_activity': [],
                'average_processing_time': 0
            })
        
        # Average confidence
        avg_confidence = query.with_entities(func.avg(Prediction.confidence)).scalar() or 0.0
        
        # High confidence count (>= 0.85)
        high_confidence_count = query.filter(Prediction.confidence >= 0.85).count()
        
        # Unique diseases
        unique_diseases = query.with_entities(Prediction.predicted_class).distinct().all()
        unique_diseases = [d[0] for d in unique_diseases if d[0]]
        
        # Disease distribution
        disease_distribution = (
            query.with_entities(
                Prediction.predicted_class, 
                func.count(Prediction.predicted_class).label('count')
            )
            .filter(Prediction.predicted_class.isnot(None))
            .group_by(Prediction.predicted_class)
            .order_by(desc(func.count(Prediction.predicted_class)))
            .all()
        )
        
        disease_distribution = [
            {'name': disease, 'count': count} 
            for disease, count in disease_distribution
        ]
        
        # Confidence distribution
        confidence_ranges = [
            (0.9, 1.0, '0.9-1.0'),
            (0.8, 0.9, '0.8-0.9'),
            (0.7, 0.8, '0.7-0.8'),
            (0.0, 0.7, '0.0-0.7')
        ]
        
        confidence_distribution = []
        for min_conf, max_conf, range_label in confidence_ranges:
            if max_conf == 1.0:
                count = query.filter(Prediction.confidence >= min_conf).count()
            else:
                count = query.filter(
                    and_(Prediction.confidence >= min_conf, Prediction.confidence < max_conf)
                ).count()
            
            confidence_distribution.append({
                'range': range_label,
                'count': count
            })
        
        # Recent activity
        recent_activity = (
            query.order_by(desc(Prediction.created_at))
            .limit(20)
            .all()
        )
        
        recent_activity = [
            {
                'id': p.id,
                'predicted_class': p.predicted_class,
                'confidence': p.confidence,
                'created_at': p.created_at.isoformat() if p.created_at else None,
                'processing_time': p.processing_time if hasattr(p, 'processing_time') else 0.05
            }
            for p in recent_activity
        ]
        
        # Average processing time
        avg_processing_time = query.with_entities(func.avg(Prediction.processing_time)).scalar() or 0.05
        
        return jsonify({
            'total_analyses': total_analyses,
            'average_confidence': float(avg_confidence),
            'high_confidence_count': high_confidence_count,
            'unique_diseases': unique_diseases,
            'disease_distribution': disease_distribution,
            'confidence_distribution': confidence_distribution,
            'recent_activity': recent_activity,
            'average_processing_time': float(avg_processing_time)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User summary analytics
def get_user_stats(user_id):
    query = Prediction.query.filter(Prediction.user_id == user_id)
    total_predictions = query.count()
    avg_confidence = query.with_entities(func.avg(Prediction.confidence)).scalar() or 0.0
    # Most common disease
    most_common = (
        query.with_entities(Prediction.predicted_class, func.count(Prediction.predicted_class))
        .group_by(Prediction.predicted_class)
        .order_by(desc(func.count(Prediction.predicted_class)))
        .first()
    )
    most_common_disease = most_common[0] if most_common else None
    # Recent predictions
    recent = (
        query.order_by(desc(Prediction.created_at)).limit(5).all()
    )
    recent_predictions = [
        {
            'date': p.created_at.isoformat() if p.created_at else None,
            'disease': p.predicted_class,
            'confidence': p.confidence
        } for p in recent
    ]
    return {
        'total_predictions': total_predictions,
        'most_common_disease': most_common_disease,
        'average_confidence': float(avg_confidence),
        'recent_predictions': recent_predictions
    }

@analytics_bp.route('/user-summary', methods=['GET'])
@require_auth
def user_summary():
    user = get_current_user()
    return jsonify(get_user_stats(user.id))

# Admin summary analytics
@analytics_bp.route('/admin-summary', methods=['GET'])
@require_admin
def admin_summary():
    total_users = User.query.count()
    total_predictions = Prediction.query.count()
    avg_confidence = db.session.query(func.avg(Prediction.confidence)).scalar() or 0.0
    # Most common diseases
    most_common = (
        db.session.query(Prediction.predicted_class, func.count(Prediction.predicted_class))
        .group_by(Prediction.predicted_class)
        .order_by(desc(func.count(Prediction.predicted_class)))
        .limit(5)
        .all()
    )
    most_common_diseases = [
        {'disease': d, 'count': c} for d, c in most_common
    ]
    # Recent predictions (all users)
    recent = (
        Prediction.query.order_by(desc(Prediction.created_at)).limit(10).all()
    )
    recent_predictions = [
        {
            'user': p.user.email if p.user else None,
            'date': p.created_at.isoformat() if p.created_at else None,
            'disease': p.predicted_class,
            'confidence': p.confidence
        } for p in recent
    ]
    return jsonify({
        'total_users': total_users,
        'total_predictions': total_predictions,
        'most_common_diseases': most_common_diseases,
        'average_confidence': float(avg_confidence),
        'recent_predictions': recent_predictions
    })

# Trends endpoint (predictions per day for last 30 days)
@analytics_bp.route('/trends', methods=['GET'])
@jwt_required()
def trends():
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=30)
    daily = (
        db.session.query(
            func.date(Prediction.created_at).label('date'),
            func.count(Prediction.id).label('count')
        )
        .filter(Prediction.created_at >= start_date)
        .group_by(func.date(Prediction.created_at))
        .order_by(func.date(Prediction.created_at))
        .all()
    )
    dates = [str(row.date) for row in daily]
    counts = [row.count for row in daily]
    return jsonify({'dates': dates, 'predictions_per_day': counts}) 