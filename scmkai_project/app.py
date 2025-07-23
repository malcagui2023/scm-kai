from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///scm_kai.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False, default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    session_id = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class SupplyChainData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(100), nullable=False)
    metric_value = db.Column(db.Float, nullable=False)
    metric_unit = db.Column(db.String(50), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# AI Response Engine
class SCMKAIEngine:
    def __init__(self):
        self.responses = {
            'fill_rate': {
                'keywords': ['fill rate', 'fill', 'stock out', 'availability'],
                'response': 'Fill rate is currently at {fill_rate}%. The main factors affecting fill rate this week are supplier delays affecting 3 key SKUs and increased demand in the Northeast region. Recommend expediting orders for SKU-A401, SKU-B205, and SKU-C108.'
            },
            'inventory': {
                'keywords': ['inventory', 'stock', 'warehouse', 'storage'],
                'response': 'Current inventory levels show {inventory_value}M in total value. We have {days_of_inventory} days of inventory on hand. Key concerns: overstock in Category A (15% above target) and potential stockouts in Category C within 5 days.'
            },
            'demand_forecast': {
                'keywords': ['demand', 'forecast', 'prediction', 'future'],
                'response': 'Demand forecast for next 30 days shows {forecast_accuracy}% accuracy. Expected demand increase of {demand_change}% in Q4. Key drivers: seasonal trends, promotional activities, and market expansion in the West region.'
            },
            'supplier': {
                'keywords': ['supplier', 'vendor', 'delivery', 'lead time'],
                'response': 'Supplier performance: {supplier_score}% on-time delivery rate. Current issues: Supplier ABC has 3-day delay, Supplier XYZ quality concerns. Recommend diversifying supplier base and implementing backup suppliers for critical SKUs.'
            },
            'cost': {
                'keywords': ['cost', 'expense', 'budget', 'savings'],
                'response': 'Supply chain costs are {cost_trend} by {cost_change}% this quarter. Main cost drivers: transportation (+12%), warehousing (+5%), inventory carrying costs (+8%). Optimization opportunities identified in route planning and inventory turnover.'
            }
        }

    def get_response(self, message):
        message_lower = message.lower()

        # Simple keyword matching for demo
        for category, data in self.responses.items():
            for keyword in data['keywords']:
                if keyword in message_lower:
                    # Simulate dynamic data
                    response = data['response'].format(
                        fill_rate=92.5,
                        inventory_value=2.3,
                        days_of_inventory=45,
                        forecast_accuracy=87,
                        demand_change=15,
                        supplier_score=94,
                        cost_trend='increased',
                        cost_change=7
                    )
                    return response

        # Default response
        return "I understand you're asking about supply chain operations. Could you be more specific about what metrics or areas you'd like me to analyze? I can help with inventory levels, demand forecasting, supplier performance, fill rates, and cost analysis."

# Initialize AI Engine
ai_engine = SCMKAIEngine()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    # Sample dashboard data
    dashboard_data = {
        'kpis': {
            'fill_rate': 92.5,
            'inventory_value': 2.3,
            'supplier_performance': 94.2,
            'cost_variance': -7.3
        },
        'alerts': [
            {'type': 'warning', 'message': 'Low stock alert for SKU-A401'},
            {'type': 'info', 'message': 'Supplier ABC delivery delayed by 2 days'},
            {'type': 'success', 'message': 'Q3 cost reduction target achieved'}
        ]
    }
    return render_template('dashboard.html', data=dashboard_data)

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/api/chat', methods=['POST'])
def api_chat():
    try:
        data = request.get_json()
        message = data.get('message', '')

        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Get AI response
        response = ai_engine.get_response(message)

        # Save conversation
        session_id = session.get('session_id', 'anonymous')
        conversation = Conversation(
            session_id=session_id,
            message=message,
            response=response
        )
        db.session.add(conversation)
        db.session.commit()

        return jsonify({
            'response': response,
            'timestamp': datetime.utcnow().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard-data')
def api_dashboard_data():
    # Sample data for dashboard
    data = {
        'inventory_levels': [
            {'category': 'Category A', 'current': 85, 'target': 70},
            {'category': 'Category B', 'current': 92, 'target': 85},
            {'category': 'Category C', 'current': 45, 'target': 60}
        ],
        'demand_forecast': [
            {'week': 'Week 1', 'forecast': 1200, 'actual': 1150},
            {'week': 'Week 2', 'forecast': 1300, 'actual': 1280},
            {'week': 'Week 3', 'forecast': 1250, 'actual': None},
            {'week': 'Week 4', 'forecast': 1400, 'actual': None}
        ],
        'supplier_performance': [
            {'supplier': 'Supplier A', 'on_time': 95, 'quality': 98},
            {'supplier': 'Supplier B', 'on_time': 87, 'quality': 92},
            {'supplier': 'Supplier C', 'on_time': 92, 'quality': 96}
        ]
    }
    return jsonify(data)

@app.route('/analytics')
def analytics():
    return render_template('analytics.html')

@app.route('/settings')
def settings():
    return render_template('settings.html')

# Initialize database
#@app.before_first_request
#def create_tables():
    db.create_all()

    # Add sample data if tables are empty
    #if SupplyChainData.query.count() == 0:
    #   sample_data = [
    #        SupplyChainData(metric_name='Fill Rate', metric_value=92.5, metric_unit='%', category='performance'),
    #        SupplyChainData(metric_name='Inventory Value', metric_value=2.3, metric_unit='M USD', category='inventory'),
    #        SupplyChainData(metric_name='Supplier Performance', metric_value=94.2, metric_unit='%', category='supplier'),
    #        SupplyChainData(metric_name='Cost Variance', metric_value=-7.3, metric_unit='%', category='cost')
    #    ]
    #    for data in sample_data:
    #        db.session.add(data)
    #    db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)

