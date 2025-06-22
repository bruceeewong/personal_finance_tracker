from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

account_bp = Blueprint('account', __name__)

@account_bp.route('/accounts')
@jwt_required()
def get_accounts():
    return jsonify({
        'message': 'Accounts endpoint',
        'accounts': []
    }), 200