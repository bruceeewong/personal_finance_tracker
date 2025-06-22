from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

budget_bp = Blueprint('budget', __name__)

@budget_bp.route('/budgets')
@jwt_required()
def get_budgets():
    return jsonify({
        'message': 'Budgets endpoint',
        'budgets': []
    }), 200