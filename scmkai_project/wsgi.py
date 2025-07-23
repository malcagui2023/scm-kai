import sys
import os

# Adjust this path to your actual project directory on your machine or Render server
project_home = '/Users/manu/Library/CloudStorage/OneDrive-SCMAnalytics/Business/Solutions/ChatBot/Internal Companion/V4/scmkai_project'

if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variable for production
os.environ['FLASK_ENV'] = 'production'

# Import the Flask app and other modules using full package path
from scmkai_project.app import app as application
from scmkai_project.models import init_sample_data, KPIMetric

# Initialize database and sample data on first run
with application.app_context():
    from scmkai_project.app import db
    db.create_all()
    if KPIMetric.query.count() == 0:
        init_sample_data()

if __name__ == "__main__":
    application.run()
