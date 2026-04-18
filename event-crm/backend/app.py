import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///event_crm.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    db.init_app(app)
    
    # Import routes (models are imported inside routes to ensure db is initialized)
    from routes import routes
    app.register_blueprint(routes.bp)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001, host='0.0.0.0')
