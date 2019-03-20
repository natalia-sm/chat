const http = require ('http');
const fs = require('fs');
const querystring = require('querystring');

const servidor= http.createServer((req, res) => {
  let {url, method} = req;

  if(url === '/' && method === 'GET') {
    let registro = fs.createReadStream(`${__dirname}/public/registro.html`);
    res.writeHead(200, {'Content-Type': 'text/html'});
    registro.pipe(res);
  } 

  if(url === '/registro.html' && method === 'POST') {
    let data = [];
    let dataBuffer;

    req.on('data', chunk => {
      data.push(chunk);
    })

    req.on('end', () => {
      dataBuffer = Buffer.concat(data).toString();

      let usuarioObj = {
        'nombre': querystring.parse(dataBuffer).nombre,
        'apellido': querystring.parse(dataBuffer).apellido,
        'usuario': querystring.parse(dataBuffer).usuario,
        'email': querystring.parse(dataBuffer).email
      }

      let usuarioJson = JSON.stringify(usuarioObj);

      const options = {
        host: 'localhost',
        port: '9090',
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(usuarioJson)
        }
      };

      const postReq = http.request(options);

      postReq.on('error', (e) => {
        console.error(e);
      }); 
      
      postReq.end(usuarioJson);

      res.writeHead('301', {'Location': 'http://localhost:3000/chat.html'});
      res.end();
    })
  }

  if(url === '/' && method === 'POST'){
    let data = [];
    let msj;

    req.on('data', chunk => {
      data.push(chunk);
    });

    req.on('end', () => {
      msj = Buffer.concat(data).toString();
      
      const options = {
        host: 'localhost',
        port: '8080',
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(msj)
        }
      };
  
      let postReq = http.request(options);
      postReq.end(msj);
    })
  }
});

const servidorChat = http.createServer((req, res) => {
  let {url, method} = req;

  if(url === '/chat.html' && method === 'GET') {
    let chat = fs.createReadStream(`${__dirname}/public/chat.html`);
    res.writeHead(200, {'Content-Type': 'text/html'});
    chat.pipe(res);
  }
});

const io = require('socket.io')(servidorChat);

io.on('connection', socket => {
  console.log('Usuario conectado');

  socket.on('mensajeEnviado', (mensaje) => {
    msjJson = JSON.stringify({'mensaje': mensaje});
    
    const options = {
      host: 'localhost',
      port: '8000',
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(msjJson)
      }
    };

    let reqPost = http.request(options);
    reqPost.end(msjJson);

    io.emit('publicarMensaje', mensaje);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

servidorChat.listen(3000);
servidor.listen(8000);