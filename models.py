from app import db, app
from datetime import datetime
import json

# Additional database models for extended functionality

class KPIMetric(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    value = db.Column(db.Float, nullable=False)
    target = db.Column(db.Float, nullable=True)
    unit = db.Column(db.String(20), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
class InventoryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    current_stock = db.Column(db.Integer, nullable=False)
    min_stock = db.Column(db.Integer, nullable=False)
    max_stock = db.Column(db.Integer, nullable=False)
    unit_cost = db.Column(db.Float, nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('supplier.id'))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

class Supplier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    contact_email = db.Column(db.String(120), nullable=True)
    performance_score = db.Column(db.Float, nullable=True)
    on_time_delivery = db.Column(db.Float, nullable=True)
    quality_score = db.Column(db.Float, nullable=True)
    lead_time_days = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(50), default='active')
    
class DemandForecast(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), nullable=False)
    forecast_date = db.Column(db.Date, nullable=False)
    forecasted_demand = db.Column(db.Integer, nullable=False)
    actual_demand = db.Column(db.Integer, nullable=True)
    accuracy = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # warning, error, info, success
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    status = db.Column(db.String(20), default='active')  # active, resolved, dismissed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

def init_sample_data():
    """Initialize the database with sample data"""
    
    # Sample Suppliers
    suppliers = [
        Supplier(name='Global Supply Co.', contact_email='contact@globalsupply.com', 
                performance_score=94.2, on_time_delivery=95.0, quality_score=98.0, lead_time_days=7),
        Supplier(name='Regional Parts Ltd.', contact_email='orders@regionalparts.com',
                performance_score=87.5, on_time_delivery=87.0, quality_score=92.0, lead_time_days=5),
        Supplier(name='Premium Components Inc.', contact_email='sales@premiumcomp.com',
                performance_score=96.8, on_time_delivery=98.0, quality_score=99.0, lead_time_days=10)
    ]
    
    for supplier in suppliers:
        if not Supplier.query.filter_by(name=supplier.name).first():
            db.session.add(supplier)
    
    db.session.commit()
    
    # Sample Inventory Items
    inventory_items = [
        InventoryItem(sku='SKU-A401', name='Premium Widget A', category='Category A',
                     current_stock=150, min_stock=50, max_stock=300, unit_cost=25.50, supplier_id=1),
        InventoryItem(sku='SKU-B205', name='Standard Component B', category='Category B',
                     current_stock=75, min_stock=100, max_stock=500, unit_cost=12.75, supplier_id=2),
        InventoryItem(sku='SKU-C108', name='Essential Part C', category='Category C',
                     current_stock=25, min_stock=30, max_stock=200, unit_cost=8.25, supplier_id=3),
        InventoryItem(sku='SKU-D302', name='Advanced Module D', category='Category A',
                     current_stock=200, min_stock=75, max_stock=400, unit_cost=45.00, supplier_id=1)
    ]
    
    for item in inventory_items:
        if not InventoryItem.query.filter_by(sku=item.sku).first():
            db.session.add(item)
    
    db.session.commit()
    
    # Sample KPI Metrics
    kpi_metrics = [
        KPIMetric(name='Fill Rate', value=92.5, target=95.0, unit='%', category='performance'),
        KPIMetric(name='Inventory Turnover', value=8.2, target=10.0, unit='times/year', category='efficiency'),
        KPIMetric(name='Order Accuracy', value=98.7, target=99.5, unit='%', category='quality'),
        KPIMetric(name='Lead Time', value=6.5, target=5.0, unit='days', category='speed'),
        KPIMetric(name='Cost per Order', value=125.50, target=120.00, unit='USD', category='cost')
    ]
    
    for metric in kpi_metrics:
        if not KPIMetric.query.filter_by(name=metric.name).first():
            db.session.add(metric)
    
    db.session.commit()
    
    # Sample Alerts
    alerts = [
        Alert(type='warning', title='Low Stock Alert', 
              message='SKU-B205 is below minimum stock level (75 < 100)', priority='high'),
        Alert(type='warning', title='Critical Stock Alert',
              message='SKU-C108 is critically low (25 < 30)', priority='critical'),
        Alert(type='info', title='Supplier Delay',
              message='Regional Parts Ltd. has reported a 2-day delay on pending orders', priority='medium'),
        Alert(type='success', title='Target Achieved',
              message='Q3 cost reduction target of 5% has been achieved', priority='low')
    ]
    
    for alert in alerts:
        if not Alert.query.filter_by(title=alert.title).first():
            db.session.add(alert)
    
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        init_sample_data()
        print("Database initialized with sample data!")

