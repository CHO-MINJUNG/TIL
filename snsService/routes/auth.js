const express = require('express');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middleware');
const User = require('../models/user');
const router = express.Router();

router.post('/join', isNotLoggedIn, async(req, res, next) => {
    const { email, nick, password} = req.body;
    try{
        const exUser = await User.findOne({ where: {email }});
        if (exUser){
            return res.redirect('/join?error=exit');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    }catch (error) {
        console.error(error);
        return next(error);
    }
});

// 프론트에서 서버로 로그인 요청을 보내는 부분
router.post('/login', isNotLoggedIn, (req, res, next) => {
    // 이 부분도 미들웨어
    // local strategy를 찾음
    passport.authenticate('local', (authError, user, info) => {
        if(authError){
            console.error(authError);
            return next(authError);
        }
        if(!user){
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }
            // 여기서 세션 쿠키를 브라우저로 보내줌
            // 로그인 성공
            return res.redirect('/');
        });
    })(req, res, next);
})

router.get('/logout', isLoggedIn, (req, res) =>{
    // logout하면 서버에서 세션 쿠키를 지워버림
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect:'/',
}), (req, res) => {
    res.redirect('/');
})

module.exports = router;