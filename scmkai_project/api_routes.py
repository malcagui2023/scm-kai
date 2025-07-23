from flask import Blueprint, jsonify, request
from app import db
from models import KPIMetric, InventoryItem, Supplier, DemandForecast, Alert
from datetime import datetime, timedelta
import json

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/kpis')
def get_kpis():
    """Get all KPI metrics"""
    kpis = KPIMetric.query.all()
    return jsonify([{
        'id': kpi.id,
        'name': kpi.name,
        'value': kpi.value,
        'target': kpi.target,
        'unit': kpi.unit,
        'category': kpi.category,
        'timestamp': kpi.timestamp.isoformat()
    } for kpi in kpis])

@api.route('/inventory')
def get_inventory():
    """Get inventory status"""
    items = InventoryItem.query.all()
    inventory_data = []
    
    for item in items:
        status = 'normal'
        if item.current_stock <= item.min_stock:
            status = 'low' if item.current_stock > item.min_stock * 0.5 else 'critical'
        elif item.current_stock >= item.max_stock:
            status = 'overstock'
            
        inventory_data.append({
            'id': item.id,
            'sku': item.sku,
            'name': item.name,
            'category': item.category,
            'current_stock': item.current_stock,
            'min_stock': item.min_stock,
            'max_stock': item.max_stock,
            'unit_cost': item.unit_cost,
            'status': status,
            'value': item.current_stock * item.unit_cost
        })
    
    return jsonify(inventory_data)

@api.route('/suppliers')
def get_suppliers():
    """Get supplier performance data"""
    suppliers = Supplier.query.all()
    return jsonify([{
        'id': supplier.id,
        'name': supplier.name,
        'performance_score': supplier.performance_score,
        'on_time_delivery': supplier.on_time_delivery,
        'quality_score': supplier.quality_score,
        'lead_time_days': supplier.lead_time_days,
        'status': supplier.status
    } for supplier in suppliers])

@api.route('/alerts')
def get_alerts():
    """Get active alerts"""
    alerts = Alert.query.filter_by(status='active').order_by(Alert.created_at.desc()).all()
    return jsonify([{
        'id': alert.id,
        'type': alert.type,
        'title': alert.title,
        'message': alert.message,
        'priority': alert.priority,
        'created_at': alert.created_at.isoformat()
    } for alert in alerts])

@api.route('/alerts/<int:alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    """Resolve an alert"""
    alert = Alert.query.get_or_404(alert_id)
    alert.status = 'resolved'
    alert.resolved_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Alert resolved successfully'})

@api.route('/forecast')
def get_forecast():
    """Get demand forecast data"""
    # Generate sample forecast data for demo
    forecast_data = []
    base_date = datetime.now().date()
    
    for i in range(30):  # 30 days forecast
        forecast_date = base_date + timedelta(days=i)
        forecast_data.append({
            'date': forecast_date.isoformat(),
            'forecasted_demand': 1200 + (i * 10) + (i % 7 * 50),  # Sample pattern
            'confidence': 85 + (i % 10),  # Sample confidence
            'trend': 'increasing' if i % 3 == 0 else 'stable'
        })
    
    return jsonify(forecast_data)

@api.route('/analytics/summary')
def get_analytics_summary():
    """Get analytics summary for dashboard"""
    
    # Calculate inventory metrics
    total_items = InventoryItem.query.count()
    low_stock_items = InventoryItem.query.filter(
        InventoryItem.current_stock <= InventoryItem.min_stock
    ).count()
    
    total_inventory_value = db.session.query(
        db.func.sum(InventoryItem.current_stock * InventoryItem.unit_cost)
    ).scalar() or 0
    
    # Get latest KPIs
    fill_rate = KPIMetric.query.filter_by(name='Fill Rate').first()
    order_accuracy = KPIMetric.query.filter_by(name='Order Accuracy').first()
    
    # Supplier metrics
    avg_supplier_performance = db.session.query(
        db.func.avg(Supplier.performance_score)
    ).scalar() or 0
    
    # Active alerts count
    active_alerts = Alert.query.filter_by(status='active').count()
    critical_alerts = Alert.query.filter_by(status='active', priority='critical').count()
    
    return jsonify({
        'inventory': {
            'total_items': total_items,
            'low_stock_items': low_stock_items,
            'total_value': round(total_inventory_value, 2),
            'stock_health': 'good' if low_stock_items < total_items * 0.1 else 'attention_needed'
        },
        'performance': {
            'fill_rate': fill_rate.value if fill_rate else 0,
            'order_accuracy': order_accuracy.value if order_accuracy else 0,
            'supplier_performance': round(avg_supplier_performance, 1)
        },
        'alerts': {
            'total': active_alerts,
            'critical': critical_alerts
        }
    })

@api.route('/search')
def search():
    """Search functionality for SCM-KAI"""
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify({'error': 'No search query provided'}), 400
    
    results = []
    
    # Search inventory items
    inventory_matches = InventoryItem.query.filter(
        db.or_(
            InventoryItem.sku.ilike(f'%{query}%'),
            InventoryItem.name.ilike(f'%{query}%'),
            InventoryItem.category.ilike(f'%{query}%')
        )
    ).limit(5).all()
    
    for item in inventory_matches:
        results.append({
            'type': 'inventory',
            'title': f"{item.sku} - {item.name}",
            'description': f"Current stock: {item.current_stock}, Category: {item.category}",
            'url': f'/inventory/{item.id}'
        })
    
    # Search suppliers
    supplier_matches = Supplier.query.filter(
        Supplier.name.ilike(f'%{query}%')
    ).limit(3).all()
    
    for supplier in supplier_matches:
        results.append({
            'type': 'supplier',
            'title': supplier.name,
            'description': f"Performance: {supplier.performance_score}%, Lead time: {supplier.lead_time_days} days",
            'url': f'/suppliers/{supplier.id}'
        })
    
    return jsonify(results)

