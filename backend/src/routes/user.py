from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint('user', __name__)

@user_bp.route('/user/profile')
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    return jsonify({
        'message': 'User profile endpoint',
        'user_id': current_user_id
    }), 200