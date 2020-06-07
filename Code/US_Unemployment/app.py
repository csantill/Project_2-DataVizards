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

import sys
print(sys.path)

#################################################
# Database Setup
#################################################

from flask_sqlalchemy import SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', '') or "sqlite:///static/assets/data/us_unemployment.db"

# # Remove tracking modifications
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

from models import *


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/demographics/")
def demographics():
    return render_template("demographics.html")

@app.route("/industry_stats/")
def industry_stats():
    return render_template("industry_stats.html")

@app.route("/census_data/")
def census_data():
    results = db.session.query(census.state, census.variable, census.value).order_by(census.state,census.variable).all()
    census_data = []

    for result in results:
        census_data.append({
            'state': result[0],
            'year':result[1],
            'value':result[2]
        })
   
    # print(jsonify(census_data))
    return jsonify(census_data)



# @app.route("/api/states")
# def states_json():
#     print("hello")
#     return send_file('/static/js/us-states.geojson',mimetype='application/json')    

if __name__ == "__main__":
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True    
    app.run()
