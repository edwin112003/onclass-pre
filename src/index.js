const express = require('express');
const path = require('path');
//buenas

const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const formatMessage = require('./lib/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./lib/users');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const router = express.Router();

const { captureRejectionSymbol } = require('events');

require('./lib/passport');

//configurar el servidor
var port = process.env.PORT || 8080;
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout : 'main',
    layout: 'login',
    layoutsDir: path.join(app.get('views'),'layouts'), 
    partialsDir: path.join(app.get('views'),'partials'),
    extname : '.hbs'
}));
app.set('view engine', '.hbs');

//Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


//socket


//globales
app.locals.nota = "";
app.locals.user = {
  id_usuario: 0,
  usertag: '',
  pass_usuario: '',
  correo_usuario: '',
  nombre_usuario: '',
  llave_usuario: '',
  nota: ''
}
app.use((req,res,next)=>{
  if (typeof(req.user) == "undefined") {
    app.locals.user = req.user;
    app.locals.nota = "";
    console.log('xdd',req.user);
  }else{
    console.log(typeof(typeof(req.user)));
    req.user.nota = app.locals.nota;
    app.locals.user = req.user;
    console.log('Aber2',req.user);
  }
    next();
});

//ruta

app.use(require('./routes'));
app.use('/links',require('./routes/links'));
const botName = 'ChatCord Bot';
io.on('connection', socket => {
    console.log('entrada de nuevo socket');
    socket.on('joinRoom', ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
      console.log('saadshgasjkdgajsghdajsgdasd',user);
  
      socket.join(user.room);
  
      // Welcome current user
      socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
  
      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage(botName, `${user.username} has joined the chat`)
        );
  
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    });
  
    // Listen for chatMessage
    socket.on('chatMessage', msg => {
      const user = getCurrentUser(socket.id);
  
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
  
    // Runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
  
      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} has left the chat`)
        );
  
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
    });
  });
//archivos publicos

//inciar servidor
http.listen(app.get('port'), ()=>{
    console.log('Server en : ', app.get('port'));  
});

