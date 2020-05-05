// server.js
const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express()
const path = require('path')
const multer = require('multer')
const fs = require('fs');
const port = process.env.PORT || 3000;

const dbName = 'filodb'
const userCollectionName = 'users'
const itemCollectionName = 'items'
const connectionStringLocal = 'mongodb://localhost:27017/' + dbName
const connectionStringRemote = "mongodb+srv://admin:admin2020@cluster0-bjw97.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname + '/uploads')
  },
  filename: function (req, file, callback) {
    console.log(file)
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

let upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    let ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      //return callback(res.end('Only images are allowed'), null)
    }
    callback(null, true)
  },

})

function renderIndexScreen(email, itemCollection, res) {
  itemCollection.find().toArray()
    .then(results => {
      console.log("renderIndexScreen: " + results);
      res.render('index.ejs', { items: results })
    })
    .catch(error => console.log(error))
}



MongoClient.connect(connectionStringRemote, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db(dbName)
    const userCollection = db.collection(userCollectionName)
    const itemCollection = db.collection(itemCollectionName)


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
      userCollection.find({ email: req.body.email }).toArray()
        .then(results => {
          if (results.length < 1) {
            res.redirect('/')
          } else {
            renderIndexScreen(req.body.email, itemCollection, res);
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



    app.post('/item', upload.single('picture'), (req, res) => {
      //   res.end('File is uploaded: ' + req.file.filename)
      if (req.file && req.file.filename) {
        req.body.filename = req.file.filename;
        console.log('file uploaded. Filename: ' + req.file.filename + ' : filepath: ' + req.file.path)
      }

      itemCollection.find().sort({ itemid: -1 }).limit(1).toArray()
        .then(result => {

          req.body.itemid = result.length > 0 ? result[0].itemid + 1 : 0;

          itemCollection.insertOne(req.body)
            .then(result => {
              renderIndexScreen(req.body.email, itemCollection, res);
            })
            .catch(error => console.error(error))
        })


      //  console.log(req.file);
      //req.body.filepath="req.file"
      // console.log(req)

    })

    app.post('/request', function (req, res) {
      itemCollection.findOneAndUpdate(
        { itemid: Number(req.body.itemid) },
        {
          $set: {
            reason: req.body.reason,
            status: 'requested'
          }
        },
        {
          upsert: true
        }
      )
        .then(result => res.json('Success'))
        .catch(error => console.error(error))
    });

    app.get('/items', (req, res) => {
      renderIndexScreen(req.body.email, itemCollection, res);
    })

    app.post('/cancelrequest', (req, res) => {
      itemCollection.findOneAndUpdate(
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
      itemCollection.findOneAndUpdate(
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

    app.listen(port, function () {
      console.log('listening on 3000')
    }
    )
  })
  .catch(error => console.error('ERROR:' + error))
