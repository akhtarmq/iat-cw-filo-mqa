// server.js
console.log('May Node be with you')

const MongoClient = require('mongodb').MongoClient
const dbName = 'testdb'
const connectionString = 'mongodb://localhost:27017/' + dbName

MongoClient.connect(connectionString, {
  useUnifiedTopology: true
}).then(client => {
    console.log('Connected to Database')
	const db = client.db(dbName)
	const testCollection = db.collection('test')
	const cursor = testCollection.find()
	cursor.toArray()
    .then(results => {
      console.log(results)
    })
    .catch(error => console.error(error))
  })
  .catch(error => console.error(error))