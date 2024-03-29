import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt"

const app = express();
const port = 3000;
let salt_rounds = 10

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "Pythondev_17",
  port: 5433,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  let user_name = req.body.username
  let password = req.body.password

  try{
    let response = await db.query('SELECT * FROM users WHERE users.usernaame = $1', [user_name])
    let result = response.rows

    if (result.length > 0){
      console.log(`User already exist. Kindly go to the login page`)
    }
    else {
      // password hashing
      bcrypt.hash(password, salt_rounds, async (err, hash) => {
        if(err){
          console.error(`Error hashing passwords`)
        }
        else{
          console.log(hash)
          await db.query('INSERT INTO users (usernaame, password ) VALUES ($1, $2)', [user_name, hash])
        }
      })
      res.render(`secrets.ejs`)
   
    }
  }
  catch(error){
     console.error(`Failed to make request`)
  }
});

app.post("/login", async (req, res) => {
  let user_name = req.body.username
  let password = req.body.password
  try{
    // Comparing the passwords

    let response = await db.query('SELECT * FROM users WHERE users.usernaame = $1', [user_name])
    let result = response.rows
    console.log(result)

    if(result.length > 0){
      let stored_password = result[0].password
      console.log(stored_password)
      

      bcrypt.compare(password, stored_password, (err, result) => {
        if(err){
          console.error(`Failed to match`)
        }
        else{
          console.log(result)
          if (result){
            res.render(`secrets.ejs`)
          }
          else{
            console.log(password)
            res.send(`incorrect password`)
          }
        }
      })
      
     
    }
    else{
      res.send(`Kindly register as a user`)
      
    }

  }
  catch(error){
     console.log(error)
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
