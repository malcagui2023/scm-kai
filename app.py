from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Create app, telling Flask to look in the instance folder for config
app = Flask(__name__, instance_relative_config=True)

# Default (fallback) config
app.config.from_mapping(
    SECRET_KEY="you-should-override-this",
    SQLALCHEMY_DATABASE_URI="sqlite:///scm_kai.db",
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
)

# Override with instance/config.py
app.config.from_pyfile("config.py", silent=True)

db = SQLAlchemy(app)

# AI Response Engine
class SCMKAIEngine:
    def __init__(self):
        self.responses = {
            "fill_rate": {
                "keywords": ["fill rate", "fill", "stock out", "availability"],
                "response": "Fill rate is currently at {fill_rate}%. The main factors affecting fill rate this week are supplier delays affecting 3 key SKUs and increased demand in the Northeast region. Recommend expediting orders for SKU-A401, SKU-B205, and SKU-C108.",
            },
            "inventory": {
                "keywords": ["inventory", "stock", "warehouse", "storage"],
                "response": "Current inventory levels show {inventory_value}M in total value. We have {days_of_inventory} days of inventory on hand. Key concerns: overstock in Category A (15% above target) and potential stockouts in Category C within 5 days.",
            },
            "demand_forecast": {
                "keywords": ["demand", "forecast", "prediction", "future"],
                "response": "Demand forecast for next 30 days shows {forecast_accuracy}% accuracy. Expected demand increase of {demand_change}% in Q4. Key drivers: seasonal trends, promotional activities, and market expansion in the West region.",
            },
            "supplier": {
                "keywords": ["supplier", "vendor", "delivery", "lead time"],
                "response": "Supplier performance: {supplier_score}% on-time delivery rate. Current issues: Supplier ABC has 3-day delay, Supplier XYZ quality concerns. Recommend diversifying supplier base and implementing backup suppliers for critical SKUs.",
            },
            "cost": {
                "keywords": ["cost", "expense", "budget", "savings"],
                "response": "Supply chain costs are {cost_trend} by {cost_change}% this quarter. Main cost drivers: transportation (+12%), warehousing (+5%), inventory carrying costs (+8%). Optimization opportunities identified in route planning and inventory turnover.",
            },
        }

    def get_response(self, message):
        m = message.lower()
        for data in self.responses.values():
            if any(k in m for k in data["keywords"]):
                return data["response"].format(
                    fill_rate=92.5,
                    inventory_value=2.3,
                    days_of_inventory=45,
                    forecast_accuracy=87,
                    demand_change=15,
                    supplier_score=94,
                    cost_trend="increased",
                    cost_change=7,
                )
        return (
            "I understand you're asking about supply chain operations. Could you be more specific "
            "about what metrics or areas you'd like me to analyze? I can help with inventory levels, "
            "demand forecasting, supplier performance, fill rates, and cost analysis."
        )


ai_engine = SCMKAIEngine()

# Routes

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/dashboard")
def dashboard():
    dashboard_data = {
        "kpis": {
            "fill_rate": 92.5,
            "inventory_value": 2.3,
            "supplier_performance": 94.2,
            "cost_variance": -7.3,
        },
        "alerts": [
            {"type": "warning", "message": "Low stock alert for SKU-A401"},
            {"type": "info", "message": "Supplier ABC delivery delayed by 2 days"},
            {"type": "success", "message": "Q3 cost reduction target achieved"},
        ],
    }
    return render_template("dashboard.html", data=dashboard_data)


@app.route("/chat")
def chat():
    return render_template("chat.html")


@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"error": "No message provided"}), 400

    response = ai_engine.get_response(message)
    return jsonify(
        {
            "response": response,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


@app.route("/api/dashboard-data")
def api_dashboard_data():
    return jsonify(
        {
            "inventory_levels": [
                {"category": "Category A", "current": 85, "target": 70},
                {"category": "Category B", "current": 92, "target": 85},
                {"category": "Category C", "current": 45, "target": 60},
            ],
            "demand_forecast": [
                {"week": "Week 1", "forecast": 1200, "actual": 1150},
                {"week": "Week 2", "forecast": 1300, "actual": 1280},
                {"week": "Week 3", "forecast": 1250, "actual": None},
                {"week": "Week 4", "forecast": 1400, "actual": None},
            ],
            "supplier_performance": [
                {"supplier": "Supplier A", "on_time": 95, "quality": 98},
                {"supplier": "Supplier B", "on_time": 87, "quality": 92},
                {"supplier": "Supplier C", "on_time": 92, "quality": 96},
            ],
        }
    )


@app.route("/analytics")
def analytics():
    return render_template("analytics.html")


@app.route("/settings")
def settings():
    return render_template("settings.html")


if __name__ == "__main__":
    app.run(debug=True)
