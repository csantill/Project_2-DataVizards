# import necessary libraries
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,send_file,
    redirect)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################

# from flask_sqlalchemy import SQLAlchemy
# app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', '') or "sqlite:///db.sqlite"

# # Remove tracking modifications
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db = SQLAlchemy(app)



@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/states")
def states_json():
    print("hello")
    return send_file('/static/js/us-states.geojson',mimetype='application/json')    

if __name__ == "__main__":
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True    
    app.run()
