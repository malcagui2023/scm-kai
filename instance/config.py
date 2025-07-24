import os

# SECURITY
SECRET_KEY = os.environ.get('SECRET_KEY', 'you-should-override-this')

# DATABASE
basedir = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') \
    or 'sqlite:///' + os.path.join(basedir, 'scm_kai.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False

# FLASK ENV
DEBUG = False
TESTING = False