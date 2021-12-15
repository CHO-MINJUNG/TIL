const exp = require('constants');
const cookieParser = require('cookie-parser');
const e = require('express');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const app = express();

// 서버에 속성(변수)를 심어주는 것 port라는 이름에 3000값 지정
// 전역 변수 같은 느낌
app.set('port', process.env.PORT || 3000)

// 요청과 응답을 기록하는 라우터, 번호, 초, 바이트
app.use(morgan('dev'));
// app.use(morgan('combined'));
// 배포할 때는 combined로 사용

// 쿠키를 알아서 parsing해줌 json형식으로
app.use(cookieParser())

// 데이터를 알아서 parsing해줌
// json의 경우 알아서 parsing
app.use(express.json());
// client에서 form을 보냈을 때
// but 이미지나 파일을 client에서 보내면 이 urlencoded는 받지 못함
app.use(express.urlencoded({extended:true})); 

// 정적 파일 모두 제공 가능 이미지 동영상 등..
// 요청 경로와 실제 경로를 서로 다르게 해서 보안에 도움을 주자
app.use('/', express.static(path.join(__dirname, 'index.html')));
// static은 next를 내포하지 않기 때문에 요청 주소에 따라 미들웨어 실행 유무가 달려있음
// 결론 = 미들웨어의 순서가 중요하다

app.use((req, res, next) => {
    console.log('모든 요청에 실행하고 싶어요');
    next();
})
// 특정 라우터에 use를 사용할 수도 있는 것
app.use('/about',(req, res, next) => {
    console.log('모든 요청에 실행하고 싶어요');
    next();
})
app.get('/', (req, res)=>{
    req.cookies
    // 쿠키 암호화 하는 경우
    req.signedCookies;
    res.sendFile(path.join(__dirname, 'index.html'));

    res.cookie('name', encodeURIComponent(name),{
        expires: new Date(),
        httpOnly: true,
        path: '/',
    })
    res.clearCookie('name', encodeURIComponent(name),{
        httpOnly: true,
        path: '/',
    })
});

app.get('/about', (req, res)=>{
    res.send('안녕 나는 어바웃');
});

// 와일드 카드
app.get('/category/:name', (req,res)=>{
    res.send(`hello ${req.params.name}`);
})
// 와일드 카드는 항상 다른 라우터보다 밑에 위치해야 함(중복으로 인한 오류를 피하기 위해)

// 404 에러 처리
// 404는 위에 라우터 전부 돌았는데 아무것도 뜨지 않은 경우
app.use((req, res, next) => {
    res.send('404지롱');
})

// 에러 미들웨어는 4가지 parameter 무조건 다 들어가야함!
app.use((err, req, res, next) => {
    console.error(err);
    res.send('에러났음 다시 실행해보세유');
})

app.listen(app.get('port'), ()=>{
    console.log('익스프레스 서버 실행');
});