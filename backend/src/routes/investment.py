from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

investment_bp = Blueprint('investment', __name__)

@investment_bp.route('/investments')
@jwt_required()
def get_investments():
    return jsonify({
        'message': 'Investments endpoint',
        'investments': []
    }), 200