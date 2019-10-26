const express = require('express');
const app = express();
const router = express.Router();
const path = __dirname + "/views/";
const bodyparser  = require('body-parser');
const mysql = require('mysql');
const url = require('url');

const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'bawaland'
});

app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended : true}));
app.use(bodyparser.json());

app.set('view engine', 'ejs');

router.use( function (req, res, next) {
	console.log("/" + req.method);
	console.log(path+req.method);
	next();
});

router.get('/', function(req, res) {
	res.sendFile( path + "index.html");
});

router.post('/auth', function (req, res) {
	console.log("[*] POST /auth");
	
	var user = req.body.username;
	var pass = req.body.pass;
	
	console.log(user + " - " + pass);
	
	if(user && pass) {
		connection.query("select pass from users where name = '"+user+"'" , function (err, result, field) {
			if(err) {
				console.log("[ERROR] Please enable Database Client...");
				return;
			}
			console.log(result);
			if(result.length > 0) {
				console.log(result[0]['pass']);
				if(result[0]['pass'] == String(pass)) {
					//res.render(path + 'home');
					console.log('[*] User confirmed');
					res.redirect('/home');
					
				}
				else {
					res.send("Wron Pass");
				}
			}
			else {
				res.send("Error wrong credentials");
			}
			
		});
	}
});

app.get('/mak', function (req, res) {
	res.sendFile(path + 'BWI.html');
})

app.get('/home', function (req, res) {
	console.log('[*] GET /home');
	//res.send("HOME");
	/**
	 * home.ejs expects a 'notes' object
	 * the object contains all the notes to
	 * display. 
	 * The notes to display are to be fetched 
	 * from the database. 
	 */

	connection.query("select * from notes", function (error, result, field) {
		if(error) {
			console.log("[ERROR] unable to fetch notes from database.\n\t* QueryError");
		}
		if(result.length > 0) {
			console.log("[*] notesData assigned");
			console.log("[*] result : "+ JSON.stringify(result));
			res.render('home', {
				titile: 'Notes',
				notesW: result
			});
		} else {
			console.log("[WARNING] no data in notes");
		}
	});

	
});

app.post('/postNote', function (req, res) {
	var title = req.body.title;
	var note  = req.body.note;
	const qry = "insert into notes(title, note) values ('"+title+"', '"+note+"')";
	connection.query(qry, function (error, result, field) {
		if(error) {
			console.log("[ERROR] query failed.\n\t* QueryError\n\t"+qry);
		}
		
		console.log("[*] Succesfully posted note to database !");
		res.redirect('/home');
	});
})

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(80, function () {
  	console.log('Bawa app listening on port 80!')
});