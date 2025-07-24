import sys
import os

# Ensure the project root is on PYTHONPATH
project_home = os.path.dirname(__file__)
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Use production environment
os.environ.setdefault('FLASK_ENV', 'production')

# Import your Flask app and database
from app import app as application, db
from models import init_sample_data, KPIMetric

# Initialize database and seed sample data on first run
with application.app_context():
    db.create_all()
    if KPIMetric.query.count() == 0:
        init_sample_data()

if __name__ == "__main__":
    application.run()
