from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

transaction_bp = Blueprint('transaction', __name__)

@transaction_bp.route('/transactions')
@jwt_required()
def get_transactions():
    return jsonify({
        'message': 'Transactions endpoint',
        'transactions': []
    }), 200