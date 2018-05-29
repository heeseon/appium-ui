var mongo = require('mongodb');
var async = require('async');
var fs = require('fs');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;


var Grid = require('gridfs-stream');
var ObjectID = require('mongodb').ObjectID;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
var server2 = new Server('localhost', 27017, {auto_reconnect: true});

var db = new Db('resultdb', server);
//var appdb = new Db('appdb', server);
var devicedb = new Db('devicedb', server2);

var gfs = Grid(db, mongo);


/*                 db.open(function(err, db) {
                    console.log("-----------------------2");
                    if(!err) {
                        console.log("Connected to 'resultdb' database");
                        db.collection('results', {safe:true}, function(err, collection) {
                            console.log("before checking error 2");
                            if (err) {
                                console.log("The 'results' collection doesn't exist. Creating it with sample data...");
                                callback("", "");
                                //populateDB();
                            }
                            else {

                                console.log("there is not happened error");
                                
                            }
                            //populateDB();

                        });
                    }
                    else {
                        console.log("db.open error");
                    }


                }); 


              }
             ],
             function(err,resultC){
                       if(err) errorHandler(err);
                             // handle resultC

                             callback("", "done");
                  }

);
*/

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'resultdb' database");
        db.collection('results', {safe:true}, function(err, collection) {
            console.log("before checking error");
            if (err) {
                console.log("The 'results' collection doesn't exist. Creating it with sample data...");
                //populateDB();
            }
            else {
                console.log("there is not happened error");
                /*
                devicedb.open(function(err, devicedb) {
                    if(!err) {
                        console.log("Connected to 'devicedb' database");
                        devicedb.collection('devices', {safe:true}, function(err, collection) {
                            console.log("before checking error");
                            if (err) {
                                console.log("The 'devices' collection doesn't exist. Creating it with sample data...");
                                //populateDB();
                            }
                            else
                                console.log("there is not happened error");

                            //populateDB();
                        });
                    }
                }); 
                */
            }
            //populateDB();
        });
    }
});

                devicedb.open(function(err, devicedb) {
                    if(!err) {
                        console.log("Connected to 'devicedb' database");
                        devicedb.collection('devices', {safe:true}, function(err, collection) {
                            console.log("before checking error");
                            if (err) {
                                console.log("The 'devices' collection doesn't exist. Creating it with sample data...");
                                //populateDB();
                            }
                            else
                                console.log("there is not happened error");

                            //populateDB();
                        });
                    }
                }); 



 
exports.addResult = function(req, res) {

    console.log("add result...");
    var device = JSON.parse(req.body.device);
    var testresult = JSON.parse(req.body.result);

    async.waterfall([
      function(callback) {
        devicedb.collection('devices').findOne(device, function(err, item) {
            if(err){
                res.send({'error':'An error while fining a device info has occurred'});
            }
            else {
                callback(null, item);
            }
            
        });
        
      },
      function(arg1, callback) {
        if(arg1 == null){
            devicedb.collection('devices').insert(device, {safe:true}, function(err, result) {
                if (err) {
                    res.send({'error':'An error while inserting a device info has occurred'});
                } else {
                    callback(null, device._id);
                }
            });
        }
        else
            callback(null, arg1._id);
      },
      function(arg1, callback) {
        testresult.device = arg1;
        db.collection('results').insert(testresult, {safe:true}, function(err, result) {
                if (err) {
                    res.send({'error':'An error while inserting a device info has occurred'});
                }
                else        
                    callback(null, 'done');
        });
      }
    ],
    // 마지막 함수에서 callback으로 전달한 인자가 넘어옵니다.
    function(err, results) {
        
        if(err)
            res.send({'error':'An error while inserting a device info has occurred'});

    });

    async.parallel([
    function(callback) {
        var writestream = gfs.createWriteStream({
            filename: req.files[0].originalname
        });
        
        fs.createReadStream(req.files[0].path).pipe(writestream);
 
        writestream.on('close', function (file) {
            callback(null, "");
        });
    },
    function(callback) {          
        var writestream = gfs.createWriteStream({
            filename: req.files[1].originalname
        });
        fs.createReadStream(req.files[1].path).pipe(writestream);
 
        writestream.on('close', function (file) {
            callback(null, "");
        });
    },
    ],
    function(err, results) {
        res.send({});
    });

   
};

exports.showLog = function(req, res) {
  var fileName = req.params.file;
}; 

exports.readFile = function(req, res) {
  var fileName = req.params.file;
  var localFile = "tmp_" + fileName;
  var b64data = "";

  console.log("====readFile........." + fileName);
  async.series([
    function (cb) {
      //write content to file system
        var fs_write_stream = fs.createWriteStream(localFile);
         
        //read from mongodb
        var readstream = gfs.createReadStream({
             filename: fileName
        });

        //write it to fs
        readstream.pipe(fs_write_stream);

        fs_write_stream.on('close', function () {
             cb(null, {});
        });
    },
    function (cb) {
      // read fs
      fs.readFile(localFile, function (err, data) {
        
        //get file stream
        b64data = new Buffer(data).toString('base64');
        console.log("data = " + data);
        // delete fs
        //fs.unlink(localFile, function (err) {
        //});
        //send file stream to client

       
        res.send(data);

        

      });
    },
    ],
    function (err, results) {
      //if (fs.existsSync(localFile)) fs.unlinkSync(localFile);
      if (err) return cb(err);
      
    });

};

 
exports.findAll = function(req, res) {

    

    var documentId = req.params.id;
    var sortOption = (documentId != "000000000000" && req.params.scope == "gt") ?  (+1*1) : (-1*1) ;
    var serachScope = (req.params.scope == "gt") ? { "$gt" : new ObjectID(documentId) } : { "$lt" : new ObjectID(documentId) };
    var pageNum = req.params.pageNum;

console.log("hs documentId = " + documentId);
console.log("hs sortOption = " + sortOption);
console.log("hs serachScope = " + serachScope);
console.log("hs pageNum = " + pageNum);



        db.collection('results').count({}, function(error, numOfDocs){
            if(!error) {
                
                if(numOfDocs == 0){
                    var obj = [];   
                    obj[0] = obj[1] = -1;
                    return res.send({"pageInfo" : obj, "data":{}, "total" : numOfDocs});
                }
                else
                db.collection('results').find({ '_id' : serachScope }).sort({'_id': sortOption}).limit(10).toArray(function(err, items) {
                    var count = items.length;
                    var callbackCount = 0 ;
                    var parallels=[];
                    for(var j = 0 ; j < items.length ; ++j){
                        var id = items[j].device;
                        parallels[j] = function(callback) {
                                    devicedb.collection('devices').findOne({'_id':id}, function(err, itemValue) {
                                        callback(null, itemValue);   
                                    });
                        }
                    }

                    async.parallel(parallels,
                    function(err, results) {
                        for(var j = 0 ; j < items.length ; ++j){
                            items[j].device = results[j];
                        }

                        if(documentId != "000000000000" && req.params.scope == "gt")items.reverse();
                                    var enablePageCount = numOfDocs/10;
                                    if(numOfDocs%10 > 0)
                                        enablePageCount = Math.floor(enablePageCount) + 1;
                                    

                                    var obj = [];   
                                    if(enablePageCount != 0 && pageNum > 1 && pageNum <= enablePageCount)
                                        obj[0] = items[0]._id ;
                                    else 
                                        obj[0] = -1;
                                    if(enablePageCount != 0 && pageNum > 0 && pageNum < enablePageCount)
                                        obj[1] = items[items.length-1]._id;
                                    else 
                                        obj[1] = -1;

                                    console.log("-------------------------------11");

                                    res.send({"pageInfo" : obj, "data":items, "total" : numOfDocs});
                                    

                    });//pararell

                });//db.collection('results').find({ '_id' : serachScope }).sort({'_id': sortOption}).limit(10).toArray(function(err, items) {
            }//if(!error) {
            //db.close();
            //callback(null, numOfDocs);
        });//db.collection('results').count({}, function(error, numOfDocs){

    //});//db.collection('results', function(err, collection) {
}; 
