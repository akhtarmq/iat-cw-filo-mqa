// server.js
const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express()
const path = require('path')
const multer = require('multer')
const fs = require('fs');
 

const dbName = 'filodb'
const userCollectionName = 'users'
const requestCollectionName = 'requests'
const connectionStringLocal = 'mongodb://localhost:27017/' + dbName
const connectionStringRemote = "mongodb+srv://admin:admin2020@cluster0-bjw97.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

let storage = multer.diskStorage({
  destination: function(req, file, callback) {
      callback(null, __dirname + '/uploads')
  },
  filename: function(req, file, callback) {
      console.log(file)
      callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
 })

MongoClient.connect(connectionStringRemote, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db(dbName)
    const userCollection = db.collection(userCollectionName)
    const requestCollection = db.collection(requestCollectionName)

    
    // ========================
    // Middlewares
    // ========================
    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static('public'))

    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html')
    })  
    
    app.post('/login', (req, res) => {
      userCollection.find({ email: req.body.email}).toArray()
        .then(results => {
          if(results.length < 1) {
            res.redirect('/')
          } else {
            res.redirect('/requests')
          }
        })
        .catch(error => console.log(error))
    })

    app.post('/newUser', (req, res) => {
      userCollection.insertOne(req.body)
        .then(result => {
          res.redirect('/')
        })
        .catch(error => console.error(error))
    })

    app.post('/requests', (req, res) => {
      requestCollection.insertOne(req.body)
        .then(result => {
          res.redirect('/requests')
        })
        .catch(error => console.error(error))
    })
    var upload = multer({ dest: '/uploads/'});
    app.post('/picture',  function(req, res){

      // var htm = req.body.htm;
      // var css = req.body.css;
  
      // res.attachment();
      // res.render('preview',{_layoutFile:'', htm:htm, css:css});

      let upload = multer({
        storage: storage,
        fileFilter: function(req, file, callback) {
            let ext = path.extname(file.originalname)
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                return callback(res.end('Only images are allowed'), null)
            }
            callback(null, true)
        }
        }).single('picture');
        upload(req, res, function(err) {
            res.end('File is uploaded' + err)
        })

     // console.log(req.file.filename);
 //  console.log(req.files.file.path);
  //  console.log(req.file);

      
  //     var file = __dirname + '/' + req.file.filename;
  // fs.rename(req.file.path, file, function(err) {
  //   if (err) {
  //     console.log(err);
  //     res.send(500);
  //   } else {
  //     res.json({
  //       message: 'File uploaded successfully',
  //       filename: req.file.filename
  //     });
  //   }});

  });

    app.get('/requests', (req, res) => {
      requestCollection.find({ email: req.body.email}).toArray()
        .then(results => {
          res.render('index.ejs', { requests: results })
        })
        .catch(error => console.log(error))
    })

    app.post('/cancelrequest', (req, res) => {
      requestCollection.findOneAndUpdate(
        { itemId: res.body.itemId },
        {
          $set: {
            status: 'cancelled'
          }
        },
        {
          upsert: true
        }
      )
        .then(result => res.json('Success'))
        .catch(error => console.error(error))
    })

    app.put('/requests', (req, res) => {
      requestCollection.findOneAndUpdate(
        { name: 'Yoda' },
        {
          $set: {
            name: req.body.name,
            category: req.body.category
          }
        },
        {
          upsert: true
        }
      )
        .then(result => res.json('Success'))
        .catch(error => console.error(error))
    })

    app.listen(3000, function() {
      console.log('listening on 3000')
    }
    )
  })
  .catch(error => console.error('ERROR:' + error))
