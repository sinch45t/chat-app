const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
// const usernames = require('./sql');
// const { usersInput } = require('./sql');
const userHandel =  require('./sql');

// console.log(typeof userHandel.usersInput);
// console.log(typeof userHandel.usernames);


// data Base connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'App',
  insecureAuth : true
});






const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public/'));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + './signup.html');
  // console.log(res.json(usernames)) ;
});

app.get('/signup',(req,res)=>{
  res.sendFile(__dirname+'/public/signup.html');
});

app.get('/usersList', (req, res) => {
  // Query to fetch users from the database
  const query = 'SELECT username FROM app';

  // Execute the query
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching users:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }
      // Extract usernames from the query results
      const users = results.map(result => result.username);
      // Send the users list as JSON response
      res.json(users);
  });
});

app.get('/users', (req, res) => {
  res.json( userHandel.usernames);
});

let date = new Date();
app.post('/signup', async (req, res) => {
  const { username, Password } = req.body; // Extract username and password from request body
  const userData = { username, Password };
  if (userData.username === 'Admin' && userData.Password === '123456') {
    // Perform server-side redirect
    return res.redirect('/admin');
  }

  try {
    // Check if user already exists in the database
    if (userData.username && userData.Password) {
      const query = `
      SELECT * FROM app 
      WHERE username = "${userData.username}" && password = "${userData.Password}"
      `;
      const sql2 = `insert into login_logs(email,login_time) VALUES('${userData.username}','${date}')`
      db.execute(sql2,(err,res)=>{
        if(err) throw err ;
        console.log(res);
      })  
      db.execute(query, function(error, data){
        console.log(data);
        if (data.length > 0) {
          // Redirect to index.html with username as query parameter
          return res.redirect(`/index.html?username=${userData.username}`);
        } else {
          return res.send("<script>alert('Invalid username');  window.location='/';</script>");
        }
      });
    }
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/register', async(req, res) => {
  const { username, email, dateOfBirth, password, confirmPassword } = req.body; 
  if(password === confirmPassword){
    // If passwords match, set userData object
    const userData = { username, email, dateOfBirth, password, confirmPassword };
    try{
      const inputData = await userHandel.usersInput(userData);
    }
      catch(err){
        console.log(`Error in regisration : ${err}`);
      }
      res.sendFile(__dirname + '/public/signup.html'); // Send the file
  }
  else{
    res.send('<script>alert("Passwords do not match!"); window.location="/register";</script>'); // Send an alert response
  }
});

app.get('/index.html', (req, res) => {
  // res.setHeader('X-Content-Type-Options', 'nosniff');
  // const username = req.query.username || 'Guest';
  res.sendFile(__dirname + '/index.html');
  const username = req.query.username;
  console.log('Username :', username);
});

app.get('/admin',(req,res)=>{
  res.sendFile(__dirname + '/public/aLogin.html')
});
//get messages from the sql server 
app.post('/admin',(req,res)=>{
  const { admin, Password } = req.body; // Extract username and password from request body
  const userData = { admin, Password };
  try{
    if(userData.admin && userData.Password){
      const query = `
      SELECT * FROM admin 
      WHERE admin_name = "${userData.admin}" && admin_password = "${userData.Password}"
      `;
      db.execute(query, function(error, data){
        console.log(data);
        if (data.length > 0) {
          // Redirect to index.html with username as query parameter
          return res.redirect(`/admin.html?adminname=${userData.admin}`);
        } else {
          return res.send("<script>alert('Invalid username & Password');  window.location='/admin';</script>");
        }
      });
    }
  }
  catch(err){

  }
})

app.get('/messages', async (req, res) => {
  try {
    // SQL query to fetch messages
    const sql = 'SELECT * FROM msg';
    // Execute the query
    db.query(sql, (error, rows) => {
      if (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log("messages");
        console.log(rows);
        res.json(rows);
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.put('/editMessage/:id', (req, res) => {
  const id = req.params.id;
  const { message } = req.body;
  // SQL query to update message by id
  const sql = `UPDATE msg SET message = ? WHERE id = ?`;
  // Execute query
  db.query(sql, [message, id], (error, results) => {
    if (error) {
      console.error('Error updating message:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.sendStatus(200);
  });
});

// Endpoint to handle delete request for messages
app.delete('/deleteMessage/:id', (req, res) => {
  const id = req.params.id;
  // SQL query to delete message by id
  const sql = `DELETE FROM msg WHERE id = ?`;
  // Execute query
  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error deleting message:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.sendStatus(200);
  });
});

app.get('/UserLogs', async (req, res) => {
  try {
    // SQL query to fetch login logs
    const sql = 'SELECT * FROM app';
    // Execute the query
    db.query(sql, (error, rows) => {
      if (error) {
        console.error('Error fetching login logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log(rows);
        res.json(rows);
      }
    });
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Endpoint to handle delete request for user logs
app.delete('/deleteUserLog/:id', (req, res) => {
  const id = req.params.id;
  // SQL query to delete user log by id
  const sql = `DELETE FROM app WHERE id = ?`;
  // Execute query
  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error deleting user log:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.sendStatus(200);
  });
});


app.get('/loginLogs', async (req, res) => {
  try {
    // SQL query to fetch login logs
    const sql = 'SELECT * FROM login_logs';
    // Execute the query
    db.query(sql, (error, rows) => {
      if (error) {
        console.error('Error fetching login logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log(rows);
        res.json(rows);
      }
    });
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.delete('/deleteEntry/:id', (req, res) => {
  const id = req.params.id;
  // SQL query to delete entry by id
  const sql = `DELETE FROM login_logs WHERE id = ?`;
  // Execute query
  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error deleting entry:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.sendStatus(200);
  });
});


io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('joinRoom', (room) => {
    socket.join(room.user);
    io.to(room.user).emit('message', ` ${room.username} has joined ${room.user} `);
  });
  
  socket.on('chatMessage', (data) => {
    // io.to(data.room).emit('message', `${data.username}${socket.id}: ${data.message}`);
    io.to(data.room).emit('message', `${data.username}: ${data.message}`);
     const sql = `insert into msg(username,message,datetime) value ('${data.username}', '${data.message}','${date}'); `
     db.execute(sql, function(error, data){
          if(data){
            console.log('text');
          } 
          else{
            if(error) throw error
          }
    }); 
    // console.log(username);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
// module.exports.getUserData = () => userData;
// console.log(module.exports.getUserData)

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

