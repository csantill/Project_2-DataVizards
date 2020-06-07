from app import db


class census(db.Model):
    index = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(64), unique=False, index=True)
    variable = db.Column(db.String(64), unique=False)
    value = db.Column(db.Integer, default=False, index=False)
