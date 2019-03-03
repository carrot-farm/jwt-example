const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
/*
    POST /api/auth/register
    {
        username,
        password
    }
*/

//가입 처리
exports.register = (req, res)=>{
    const {username, password} = req.body;
    let newUser = null;



    //유저 생성
    const create = (user)=>{
        console.log('>>> create', user)
        if(user){
            throw new Error('username exists');
        }else{
            return User.create(username, password);
        }
    };

    //유저 수 세기
    const count = (user)=>{
        console.log('count')
        newUser = user;
        return User.count({}).exec();
    };

    //첫 가입자는 관리자 계정으로 생성
    const assign = (count)=>{
        if(count === 1){
            return newUser.assignAdmin()
        }else{
            return Promise.resolve(false);
        }
    };

    //반환
    const respond = (isAdmin)=>{
        res.json({
            message: 'registered successfully',
            admin: isAdmin?true:false
        })
    };

    //에러 처리
    const onError = (error)=>{
        res.status(409).json({
            message: error.message
        })
    };

    if(!username || !password){
        return onError('유저 정보를 입력해 주십시요.');
    }

    //실행
    User.findOneByUsername(username)
    .then(create)
    .then(count)
    .then(assign)
    .then(respond)
    .catch(onError)
};

//========== 로그인 처리
//jwt 발행
exports.login = (req, res)=>{
    const {username,password} = req.body;
    const secret = req.app.get('jwt-secret');

    //유저 정보 체크 및 jwt 생성
    const check = (user)=>{
        if(!user){
            throw new ErrorEvent('login failed');
        }else{
            if(user.verify(password)){
                const p = new Promise((resolve, reject)=>{
                    jwt.sign(
                        {
                            _id: user._id,
                            username: user.username,
                            admin: user.admin
                        },
                        secret,
                        {
                            expiresIn: '7d',
                            issuer: 'velopert.com',
                            subject: 'userInfo',
                        },
                        (err, token)=>{
                            if(err){reject(err)}
                            resolve(token);
                        }
                    )
                });
                return p;
            }else{
                throw new Error('login failed');
            }
        }
    };

    //토큰 반환
    const respond = (token)=>{
        res.json({
            message: 'logged in successfully',
            token
        });
    }

    //error 
    const onError = (error)=>{
        res.status(403).json({
            message: error.message
        })
    };

    User.findOneByUsername(username)
    .then(check)
    .then(respond)
    .catch(onError)
    ;

};

//=========== jwt 체크
//authMiddleware에서 토큰 검증을 하기 때문에 
//검증실패에 대해 처리 하지 않아도 된다.
exports.check = (req, res)=>{
    res.json({
        success: true,
        info: req.decoded
    });

};