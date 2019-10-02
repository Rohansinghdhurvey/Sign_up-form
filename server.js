const express = require('express');
const mongo  = require('mongodb');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
var url = "mongodb://localhost:27017/formdata";

app.use('/public', express.static(__dirname + '/public'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));


var getHash = ( pass, phone ) => {
    var hmac = crypto.createHmac('sha512', phone);

    // passing data to be hashed
    data = hmac.update(pass);
    // creating the hmac in required format
    gen_hmac = data.digest('hex');  //check this one and corrent it
    // printing the output on the console
    console.log("hmac : " + gen_hmac);
    return gen_hmac;
}

app.get('/', (req, res) => {
    res.set({
        'Access-Control-Allow-Origin' : '*'
    });
    return res.redirect('/public/index.html');
});

app.post('/sign_up', function(req, res) {
    var name = req.body.name;
	var email= req.body.email;
	var pass = req.body.password;
	var phone = req.body.phone;
	var password = getHash( pass , phone ); 

    var data = {
        "name" : name,
        "email": email,
        "password": password,
        "phone" : phone
    }

    mongo.connect(url, function(error , db) {
        if (error) throw error;

        var dbo = db.db("formdata");

        console.log("connected to database successfully");
        // creating collection in mongodb

        dbo.collection("details").insertOne(data, (err, collection) => {
            if (err) throw err;
            console.log("record inserted successfully");
            console.log(collection);
        });
    });

    console.log("DATA is " + JSON.stringify(data) );
    res.set({
		'Access-Control-Allow-Origin' : '*'
	});
	return res.redirect('/public/success.html');  
  })

app.listen(3000);
console.log('server is listening at port : 3000');
