from app import app, db
from models import init_sample_data

with app.app_context():
    db.create_all()
    init_sample_data()
    print("Database initialized with sample data!")
