//const mongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/Test', (err, client) => {
    if(err){
        return console.log(`Unable to connect to MongoDB server`);
    }
    console.log(`Connect to MongoDB Server`);

    const db = client.db('Beam');
    
    //===========================================================
    /* db.collection('Account').insertOne({
        name: 'Paveen',
        lastName: 'Asawasuebsakul'
    }, (err, result) =>{
        if(err){
            return console.log(`Unable insertOne: ${err}`);
        }
        console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
    }); 
    
    //Find term by id by using {_id: new ObjectID('id_name')}
    db.collection('Account').find().toArray().then((docs) => {

    }, (err) => {

    });
    */


    client.close();
});
