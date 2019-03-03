const User = require('../../../models/user');

/*
    GET /api/user/list
*/

exports.list = (req, res)=>{

    //관리자가 아닐경우
    if(!req.decoded.admin){
        return res.status(403).json({
            message: 'you are not an admin'
        })
    }

    //전체 유저 정보
    User.find({})
    .then(
        users=>{
            res.json({users})
        }
    );
};

/*
    POST /api/user/assign-admin/:username
*/
//======== 관리자 전환
exports.assignAdmin = (req, res)=>{
    if(!req.decoded.admin){
        return res.status(403).json({
            message: 'you are not and admin'
        });
    }

    User.findOneByUsername(req.params.username)
    .then(
        user=>user.assignAdmin
    ).then(
        res.json({
            success: true
        })
    )
};