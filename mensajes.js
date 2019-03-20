const http = require('http');
const mysql = require('mysql');

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'fizzdb',
  password: 'fizzmod'
});

const servidor = http.createServer((req, res) => {
  let {url, method} = req;

  if(url === '/' && method === 'POST') {
    con.query('CREATE TABLE IF NOT EXISTS mensajes (id_mensaje INT NOT NULL AUTO_INCREMENT PRIMARY KEY, cuerpo VARCHAR(45) NOT NULL, creado_en DATETIME NOT NULL, actualizado_en DATETIME NOT NULL, id_usuario VARCHAR(45) NOT NULL, id_status VARCHAR(45) NOT NULL)');
    
    con.query('CREATE TABLE IF NOT EXISTS status_mensajes (id_status INT NOT NULL, descripcion VARCHAR(45) NOT NULL)');
  
    let dataChunks = [];
  
    req.on('data', chunk => {
      dataChunks.push(chunk);
    });
  
    req.on('end', () => {
      let msj = Buffer.concat(dataChunks).toString();
      let mensajeTxt = JSON.parse(msj).mensaje;
  
      function obtenerFechaHora() {
        let fecha = new Date();
        let hora = fecha.getHours();
        hora = (hora < 10 ? "0" : "") + hora;
        let min  = fecha.getMinutes();
        min = (min < 10 ? "0" : "") + min;
        let seg  = fecha.getSeconds();
        seg = (seg < 10 ? "0" : "") + seg;
        let anio = fecha.getFullYear();
        let mes = fecha.getMonth() + 1;
        mes = (mes < 10 ? "0" : "") + mes;
        let dia  = fecha.getDate();
        dia = (dia < 10 ? "0" : "") + dia;
        return anio + ":" + mes + ":" + dia + " " + hora + ":" + min + ":" + seg;
      }
  
      let fecha = obtenerFechaHora();
  
      con.query("INSERT INTO mensajes (cuerpo, creado_en, actualizado_en, id_usuario, id_status) VALUES (?, ?, ?, ?, ?)",[mensajeTxt, fecha, fecha, '1', '1']);
    }) 
  };
});

con.connect((e) => {
  if (e) {
    console.log('error: ', e)
  }
  console.log('Conectado a la base de datos');
  servidor.listen(8080);
});