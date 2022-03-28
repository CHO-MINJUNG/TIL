const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id); //세션에 user id만 저장
    });

    // {id:3, 'connect.sid': s%323512351235 }

    passport.deserializeUser((id, done) => {
        User.findOne({ where: {id}})
            .then(user => done(null, user)) // req.user // 로그인한 사용자의 정보
            // req.isAuthenticated() -> 로그인 했다면 true
            .catch(err => done(err));
    });

    local();
    kakao();
}