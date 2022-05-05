
/**
 * Created by awilcox on 07/05/2015.
 */
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var cred = require('../config/credentials.json');

var pool = [];
var options = {
    uri_decode_auth: true,
    server: {
        poolsize: 10
    }
};


/**
 * Connection pool for mongodb connections
 *
 * @param dbName
 * @param callback
 */
var connectionPool = function(dbName, callback) {
    //var connectString = cred.host + dbName ;
    var connectString = cred.host + dbName + '?authSource=admin';

    if (typeof pool[dbName] !== 'undefined') {

        callback(pool[dbName]);

    } else {
        MongoClient.connect(connectString, options, function (err, db) {
            if (err) {
                console.error("Error connecting to " + connectString);
            } else {
                console.log('Connected to ' + connectString);
            }

            pool[dbName] = db;
            callback(db)
        });
    }
};


var insertDocuments = function (db, collection, values, callback) {
    try {
        var col = db.collection(collection);

        if (Array.isArray(values)) {
            col.insertMany(values, callback);
        } else {
            col.insertOne(values, callback);
        }
    } catch (err) {
        console.error(err);
        callback(err,[]);

    }
};

var findDocuments = function (db, collection, query, projection, callback) {
    try {
        var col = db.collection(collection);
        col.find(query, projection).toArray(callback);
    } catch(err) {
        console.error(err);
        callback(err,[]);
    }
};

var aggregateDocuments = function (db, collection, pipeline, callback) {
    try {
        var col = db.collection(collection);
        col.aggregate(pipeline).toArray(callback);
    } catch (err) {
        console.error(err);
        callback(err, []);
    }
};

var distinctQuery = function (db, collection, field, callback) {
    try {
        var col = db.collection(collection);
        col.distinct(field, callback);
    } catch(err) {
        console.error(err);
        callback(err, []);
    }
};

var dropCollection = function(db, collection, callback) {
    try {
        db.dropCollection(collection, callback);

    } catch(err) {
        console.error(err);
        callback(err, []);
    }
};

var deleteOne = function(db, collection, filter, callback) {
    try {
        var col = db.collection(collection);

        col.deleteOne(filter, callback);
    } catch(err) {
        console.error(err);
        callback(err, []);
    }

};

var deleteMany = function(db, collection, filter, callback) {
    try {
        var col = db.collection(collection);

        col.deleteMany(filter, callback);
    } catch(err) {
        console.error(err);
        callback(err, []);
    }

};

var updateOne = function(db, collection, selector, document, callback) {
    try {
        var col = db.collection(collection);

        col.updateOne(selector, document, callback);
    } catch(err) {
        console.error(err);
        callback(err, []);
    }

};

var listDatabases =  function(db, callback) {
    try {
        // Use the admin database for the operation
        var adminDb = db.admin();
        adminDb.listDatabases(callback);
    } catch (err) {
        console.error(err);
        callback(err, []);
    }
};


var listCollections = function(db, callback) {
    try {
        db.listCollections().toArray(callback);

    } catch(err) {
        console.error(err);
        callback(err, []);
    }
};


var listSchema = function(db, collection, callback) {
    try {

        var col = db.collection(collection);

        var map = function() {

            for (var key in this) { emit(key, null); }
        };

        var reduce = function(k, vals) {

            return null; };

        col.mapReduce(map, reduce, {out : {inline: 1}, verbose:true, limit: 10000}, callback);

    } catch (err) {
        console.error(err);
        callback(err, []);
    }
};

module.exports = {
    /**
     *
     * @param id
     */
    convertToObjectId: function (id) {
        return new ObjectID(id);
    },
    /**
     *
     * @param db
     * @param collection
     * @param values
     * @param callback
     */
    insert: function (dbName, collectionName, values, callback) {
        var fn = function(db) {
            insertDocuments(db, collectionName, values, callback);
        };
        connectionPool(dbName, fn);
    },
    /**
     *
     * @param dbname
     * @param collection
     * @param query
     * @param callback
     */
    query: function (dbName, collectionName, query, projection, callback) {
        var fn = function(db) {
            findDocuments(db, collectionName, query, projection, callback);
        };
        connectionPool(dbName, fn);
    },
    /**
     *
     * @param dbName
     * @param collectionName
     * @param pipeline
     * @param callback
     */
    aggregateQuery: function(dbName, collectionName, pipeline, callback) {
        var fn = function(db) {
            aggregateDocuments(db, collectionName, pipeline, callback);
        };
        connectionPool(dbName,fn);
    },
    /**
     *
     * @param dbname
     * @param collectionName
     * @param field
     * @param callback
     */
    distinctQuery: function(dbName, collectionName, field, callback) {
        var fn = function(db) {
            distinctQuery(db, collectionName, field, callback);
        };
        connectionPool(dbName,fn);
    },
    /**
     *
     * @param dbName
     * @param collectionName
     * @param callback
     */
    dropCollection: function(dbName, collectionName, callback) {
        var fn = function(db) {
            dropCollection(db,collectionName,callback);
        };
        connectionPool(dbName, fn);
    },
    /**
     *
     * @param dbName
     * @param collectionName
     * @param filter
     * @param callback
     */
    deleteDocument: function(dbName, collectionName, filter, callback) {
       var fn = function(db) {
           deleteOne(db, collectionName, filter, callback);
       };
       connectionPool(dbName, fn);
    },
    /**
     *
     * @param dbName
     * @param collectionName
     * @param filter
     * @param callback
     */
    deleteManyDocuments: function(dbName, collectionName, filter, callback) {
        var fn = function(db) {
            deleteMany(db, collectionName, filter, callback);
        };
        connectionPool(dbName, fn);
    },
    /**
     *
     * @param dbName
     * @param collectionName
     * @param selector
     * @param document
     * @param callback
     */
    updateOne: function(dbName, collectionName, selector, document, callback) {
        var fn = function(db) {
            updateOne(db, collectionName, selector, document, callback);
        };
        connectionPool(dbName, fn);
    },
    /**
     *
     * @param callabck
     */
    listDatabases: function(callback) {
        var fn = function (db) {
             listDatabases(db, callback);
        };
        connectionPool('test',fn);
    },
    /**
     *
     * @param dbName
     * @param callback
     */
    listCollections : function(dbName, callback) {
        var fn = function(db) {
            listCollections(db, callback);
        };
        connectionPool(dbName ,fn);
    },
    /**
     *
     * @param dbName
     * @param colection
     * @param callback
     */
    listSchema: function(dbName, collectionName, callback) {
        var fn = function(db) {
            listSchema(db, collectionName, callback);
        };
        connectionPool(dbName,fn);
    }

};