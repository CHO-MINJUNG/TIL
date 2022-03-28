const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passportConfig = require('./passport');

// dotenv는 require하고 최대한 위에!
dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth')
const { sequelize } = require('./models');

const app = express();
// 개발과 배포의 포트를 다른 것을 사용하기 위해
app.set('port', process.env.PORT || 8001);
// 넌적스 환경 설정
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});
sequelize.sync({force: false})
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

passportConfig();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));
// session을 받아서 처리하므로 express session보다 아래에 있어야 함
app.use(passport.initialize());
// 세션 값을 주면 id 값을 알아냄
// 로그인 후에 그 다음 요청부터 passport session이 수행될 때 deserialize가 실행됨
app.use(passport.session());


app.use('/', pageRouter);
app.use('/auth', authRouter)

// 404처리 미들웨어
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});