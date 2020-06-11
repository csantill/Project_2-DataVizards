# from .app import db
from app import db


class census(db.Model):
    index = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(64), unique=False, index=True)
    variable = db.Column(db.String(64), unique=False)
    value = db.Column(db.Integer, default=False, index=False)

class claims(db.Model):
    __tablename__ = 'state_claims'
    index = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(64), unique=False, index=True)
    year_month = db.Column(db.String(64), unique=False)
    year = db.Column(db.String(64), unique=False)
    month = db.Column(db.String(64), unique=False)
    initial_claim = db.Column(db.Integer, unique=False)
    continued_claim = db.Column(db.Float, unique=False)
    average_insured_unemployment_rate = db.Column(db.Float, unique=False)
    

