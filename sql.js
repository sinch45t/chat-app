const { json } = require('body-parser');
const mysql = require('mysql2');
// const { getUserData } = require('./app.js');
// const userData = getUserData;1

// console.log(userData);


// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'App',
  insecureAuth : true
});


// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

function append(obj, key, value) {
  obj[key] = value;
}
let sql =  `select * from app`;

let usernames = [];
db.execute(sql, function(err,result){
 if(err) throw err;
 let count = 0 ;
  console.log(result);
  // let str = json.toString(result);
  // console.log(str);
  // Loop through the array and extract usernames
   for (let i = 0; i < result.length; i++) {
  // append(username,result[i].id,result[i].username);
     usernames.push(result[i].username);
 }
  console.log(`${usernames} sent it to server`);
});

function usersInput(usersData){
  let sql = `insert into app(username,email,date_of_birth,Password) value ('${usersData.username}', '${usersData.email}','${usersData.dateOfBirth}', '${usersData.password}')`;
  db.execute(sql,function(err,result){
    if(err) throw err;
    console.log(result);
  })
  return console.log(sql);
}

module.exports = {
  usernames,
  usersInput
};

// module.exports.usersInput = usersInput;

// module.exports = usernames;




