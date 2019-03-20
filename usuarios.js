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

    con.query('CREATE TABLE IF NOT EXISTS usuarios (id_usuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(45)NOT NULL, apellido VARCHAR(45) NOT NULL, nombre_de_usuario VARCHAR(45) NOT NULL, email VARCHAR(45) NOT NULL, creado_en DATETIME NOT NULL, actualizado_en DATETIME NOT NULL, id_status VARCHAR(45) NOT NULL)');
      
    con.query('CREATE TABLE IF NOT EXISTS status_usuarios (id_status INT NOT NULL, descripcion VARCHAR(45) NOT NULL)');
  
    let dataChunks = [];
    
    req.on('data', chunk => {
      dataChunks.push(chunk);
    });
  
    req.on('end', () => {
      let usuarioJson = Buffer.concat(dataChunks).toString();
    
      let usuarioNuevo = JSON.parse(usuarioJson);
  
      let nombre = usuarioNuevo.nombre; 
      let apellido = usuarioNuevo.apellido;
      let usuario = usuarioNuevo.usuario;
      let email = usuarioNuevo.email;
  
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
  
      con.query('INSERT INTO usuarios (nombre, apellido, nombre_de_usuario, email, creado_en, actualizado_en, id_status) VALUES (?, ?, ?, ?, ?, ?, ?)', [nombre, apellido, usuario, email, fecha, fecha, '1']);

      con.end(e => {
        if (e) {
          console.log(e);
        }
      });
    }) 
  }
});

con.connect((e) => {
  if (e) {
    console.log('error: ', e)
  }
  console.log('Conectado a la base de datos');
  servidor.listen(9090);
});