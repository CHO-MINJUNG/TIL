const http = require('http');
const fs = require('fs').promises;
const url = require('url');
const qs = require('querystring');

const parseCookies = (cookie = '') =>
  cookie
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});

http.createServer(async (req, res) => {
    // req.headers.cookie는 문자열 이므로 이를 json형식으로 변환해주는 함수에 적용
  const cookies = parseCookies(req.headers.cookie); // { mycookie: 'test' }
  // 주소가 /login으로 시작하는 경우
  if (req.url.startsWith('/login')) {
    // 이렇게 하면 queryString뒤에 name을 추출할 수 있음
    const { query } = url.parse(req.url);
    const { name } = qs.parse(query);
    const expires = new Date();
    // 쿠키 유효 시간을 현재시간 + 5분으로 설정
    expires.setMinutes(expires.getMinutes() + 5);
    // 302는 redirection -> 아까 그 주소로 정보를 다시 돌려 보내는 것, 슬래쉬가 붙어서..
    // 301이나 302가 redirect임을 기억하자
    res.writeHead(302, {
      Location: '/',
      // 한글이 cookie에 들어가면 안 되서 encodeURIComponent필수
      // 쿠키의 만료기간을 설정해줘야함(안 해주면 세션쿠키가 됨=브라우저를 끄면 정보가 사라짐)
      'Set-Cookie': `name=${encodeURIComponent(name)}; Expires=${expires.toGMTString()}; HttpOnly; Path=/`,
      // HttpOnly = javascript로 쿠키에 접근하지 못하게 하는 것(쿠키들은 js로 접근하면 보안에 위험하기 때문에)
      // 로그인을 위해 사용하는 쿠키는 httponly가 필수라고 생각하면 됨!
      // Path = / 는 슬래쉬 아래있는 주소에서 쿠키가 유효하다는 의미
      // 결론적으로 login창에서 요청을 보냈는데 기본 홈으로 돌아가게 되었다!
    });
    res.end();

  // 쿠키가 있냐 없냐에 따라 분기 처리를 해줄 수 있는 것! 
  // name이라는 쿠키가 있는 경우
  } else if (cookies.name) {
      // 위에 setCookie를 통해 cookie를 넣어줬기 때문에 여기로 오게 됨
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`${cookies.name}님 안녕하세요`);
  } else {
      // login, cookie 모두가 없는 경우
    try {
      const data = await fs.readFile('./cookie2.html');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(err.message);
    }
  }
})
  .listen(8084, () => {
    console.log('8084번 포트에서 서버 대기 중입니다!');
  });