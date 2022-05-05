/**
 * Created by awilcox on 11/05/2015.
 */
var access = require('../config/access-config.json');
var config = require('../config/config.json');
var UrlUtils = require('../utils/url-utils');
var mongo = require('../utils/mongo-connect');
var textUtils = require('../utils/utils');
var json2mongo = require('json2mongo');

/*
 return JSON object of undefined
 */
var parseUnknown = function (obj) {
    try {

        if (typeof obj === "string" && obj !== "") {
            return json2mongo(JSON.parse(obj));
        } else if (typeof obj === "object" && obj) {
            return json2mongo(obj);
        } else {
            return null;
        }

    } catch (err) {
        console.error(err);
        return null;
    }
};

var notEmpty = function (string) {
    if (typeof string !== 'undefined' && string !== '') {
        return string;
    } else {
        return null;
    }
};


module.exports = {
    
    
    /**
     * API interface to list databases
     *
     * GET /dbapi
     *
     * @param req
     * @param res
     * @param next
     */
    getApi: function (req, res, next) {
        try {
            mongo.listDatabases(function (err, dbs) {
                if (err) {
                    res.status(500).json({error: 'List Databases Failed'});
                    console.error(err);
                } else {
                    res.status(200).json(dbs);
                }
            });
        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);
        }
    },
    /**
     *
     * @param req
     * @param res
     * @param next
     */
    getAPICollections: function (req, res, next) {
        var dbName = req.params['database'];

        try {
            mongo.listCollections(dbName, function (err, collections) {
                if (err) {
                    res.status(500).json({error: 'List Collections Failed'});
                    console.error(err);
                } else {
                    res.status(200).json(collections);
                    console.log("Found " + collections.length + " Collections");
                }
            });
        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);
        }

    },
    getAPISchema: function(req, res, next) {
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];

        try {
            mongo.listSchema(dbName, collectionName, function (err, results, stats) {
                if (err) {
                    res.status(500).json({error: 'List Schema Failed'});
                    console.error(err);
                } else {
                    res.status(200).json(results);

                }
            });
        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);
        }
    },
    /**
     * API interface to get a distinct list of values from a field
     *
     * GET /dbapi/:database/:collection/distinct/:field
     *
     * param: database
     * param: collection
     * param: field
     *
     * @param req
     * @param res
     * @param next
     */
    getAPIDistinct: function (req, res, next) {
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];
        var fname = req.params['field'];

        try {
            console.log('Distinct : ' + fname);

            //post only accepts json
            mongo.distinctQuery(dbName, collectionName, fname, function (err, docs) {
                if (err) {
                    res.status(500).json({error: 'Query Failed'});
                    console.error(err);
                } else {
                    res.status(200).json(docs);
                    console.log("Found : " + docs.length);
                }
            });
        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);
        }

    },
    /**
     * API interface to get a document or documents from a collection
     *
     * route: GET /dbapi/:database/:collection/:field/:value
     *
     * param: database
     * param: collection
     * param: field
     * param: value
     *
     * query: type
     *
     * @param req
     * @param res
     * @param next
     */
    getAPIDocuments: function (req, res, next) {
        var query = {};
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];
        var fname = req.params['field'];
        var value = req.params['value'];

        try {
            if (req.query['type'] === "int") {
                value *= 1;
            }

            /**
             * Callback for API within this scope
             * @param err
             * @param docs
             */
            if (fname === '_id') {
                query[fname] = mongo.convertToObjectId(value);
            } else {
                query[fname] = value;
            }

            console.log('Query : ' + JSON.stringify(query));

            //post only accepts json
            mongo.query(dbName, collectionName, query, {}, function (err, docs) {
                if (err) {
                    res.status(500).json({error: 'Query Failed'});
                    console.error(err);
                } else {
                    res.status(200).json(docs);
                    console.log("Found : " + docs.length);
                }
            });
        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);
        }
    },
    /**
     * API interface to delete a document from a collection
     *
     * route: DELETE /dbapi/:database/:collection/deletedocs
     *
     * param: database
     * param: collection
     *
     * req: filter
     *
     *
     * query: type
     * @param req
     * @param res
     * @param next
     */
    deleteAPIDeleteDocs: function (req, res, next) {
        var filter = {};
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];
        var filter = parseUnknown(req.body['filter']);

        try {

            if (filter && typeof filter['_id'] !== 'undefined') {
                filter['_id'] = mongo.convertToObjectId(filter['_id']);
            }

            console.log('Filter : ' + JSON.stringify(filter));

            //post only accepts json
            mongo.deleteManyDocuments(dbName, collectionName, filter, function (err, r) {
                if (err) {
                    res.status(500).json({error: 'Delete Failed'});
                    console.error(err);
                } else {
                    res.status(204).json(r);
                    console.log(JSON.stringify(r));
                }
            });
        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);
        }
    },
    /**
     * API interface to delete a collection
     *
     * route: DELETE /dbapi/:database/:collection/drop
     *
     * param: database
     * param: collection
     *
     *
     * @param req
     * @param res
     * @param next
     */
    deleteAPIDropCollection: function (req, res, next) {
        var filter = {};
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];


        try {

            mongo.dropCollection(dbName, collectionName, function (err, r) {
                if (err) {
                    res.status(500).json({error: 'Delete Failed'});
                    console.error(err);
                } else {
                    res.status(204).json(r);
                    console.log(JSON.stringify(r));
                }
            });
        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);
        }

    },
    /**
     * API for updating a document
     *
     *  route: PUT /dbapi/:database/:collection
     *
     * param: database
     * param: collection
     * param: selector
     * param: document
     *
     *
     * @param req
     * @param res
     * @param next
     */
    putAPIUpdateDoc: function (req, res, next) {
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];
        var selector = parseUnknown(req.body['selector']);
        var document = parseUnknown(req.body['document']);


        var callback = function (err, r) {
            if (err) {
                res.status(500).json({error: 'update Failed'});
                console.error(err);
            } else {
                res.status(200).json(r);
                console.log(JSON.stringify(r));

            }
        };

        try {
            console.log("selector : " + JSON.stringify(selector));

            if (selector && document) {
                mongo.updateOne(dbName, collectionName, selector, document, callback);
            } else {
                res.status(200).json("{}");
            }

        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);
        }
    },
    /**
     * API interface for complex queries
     *
     *
     * Route: /dbapi/:database/:collection/query
     *
     * param: :database
     * param: :collection
     *
     * req: query
     * req: projection
     *
     * @param req
     * @param res
     * @param next
     */
    postAPIQuery: function (req, res, next) {
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];
        var query = parseUnknown(req.body['query']);
        var projection = parseUnknown(req.body['projection']);
        var pipeline = parseUnknown(req.body['pipeline']);
        var distinct = notEmpty(req.body['distinct']);

        var callback = function (err, docs) {
            if (err) {
                res.status(500).json({error: 'Query Failed'});
                console.error(err);
            } else {
                res.status(200).json(docs);
                console.log("Found : " + docs.length);
            }
        };


        try {

            if (query) {

                if (projection === null) projection = {};
                console.log('Query: ' + JSON.stringify(query));
                console.log('Projection: ' + JSON.stringify(projection));

                //search for "_id" field
                //if found convert to ObjectID
                if (query && typeof query['_id'] !== 'undefined') {
                    query['_id'] = mongo.convertToObjectId(query['_id']);
                }

                console.log('Query : ' + JSON.stringify(query));

                mongo.query(dbName, collectionName, query, projection, callback);

            } else if (pipeline) {
                console.log('Pipeline: ' + JSON.stringify(pipeline));
                mongo.aggregateQuery(dbName, collectionName, pipeline, callback);

            } else if (distinct) {
                console.log('Distinct: ' + distinct);
                mongo.distinctQuery(dbName, collectionName, distinct, callback);
            } else {
                res.status(200).send("{}");
            }

        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);

        }
    },
    /**
     * API interface to add documents to a collection
     *
     * route: POST /dbapi/:database/:collection
     *
     * param: :database
     * param: :collection
     *
     * req: data - JSON string containing one or more documents
     *
     *
     * @param req
     * @param re
     * @param next
     */
    postAPIInsert: function (req, res, next) {
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];

        /**
         *
         * @param err
         * @param r
         */

        try {
            var data = json2mongo(JSON.parse(req.body.data));

            mongo.insert(dbName, collectionName, data, function (err, r) {
                if (err) {
                    //test err code
                    if(err['code'] === 11000) {
                        res.status(202).json({message: 'Duplicate Key'});
                        console.log('Duplicate Key');

                    } else {
                        res.status(500).json({error: 'Insert Failed'});
                        console.error(err);
                    }

                } else {
                    console.log(JSON.stringify(r));
                    res.status(200).json(r);
                }
            });

        } catch (err) {
            res.status(500).json({error: err});
            console.error(err);

        }
    },

    /**
     * Plug in route to tell user that this feature is not implemented
     *
     * route: *
     *
     * @param req
     * @param res
     * @param next
     */
    routeNotImplemented: function (req, res, next) {
        res.send('{ message: " API Not implemented}"');
    },
    /**
     * Basic view for inserting data from a browser
     *
     * route: GET /insert
     *
     * @param req
     * @param res
     * @param next
     */
    getInsert: function (req, res, next) {
        var urlUtils = new UrlUtils(req, ['db']);

        res.render('db-insert', {
            layout: 'layouts/default',
            pages: textUtils.filterMenu(access['app-menus']['db'], req.user.userType, req.user.userGroups),
            product: config['product'],
            home: urlUtils.getHost(),
            user: req.user
        });
    },
    /**
     * Browser based post to insert data into the db
     *
     * route: POST /insert
     *
     * req: DB
     * req: collection
     * req: data - JSON string containing one or more documents
     *
     * @param req
     * @param res
     * @param next
     */
    postInsert: function (req, res, next) {
        var dbName = req.body['db'];
        var collectionName = req.body['collection'];
        var data = parseUnknown(req.body['data']);


        console.log(req.body['data']);

        console.log(JSON.stringify(data, null, 4));

        if (data) {
            mongo.insert(dbName, collectionName, data, function (err, r) {
                if (err) {
                    if (req.xhr) {
                        res.status(500).json({error: 'Insert Failed'});
                    } else {
                        next(err);
                    }
                } else {
                    res.redirect('/');
                    console.log(JSON.stringify(r));
                }
            });
        }
    },
    /**
     * Basic view for querying DB
     *
     * Route: get /query
     * @param req
     * @param res
     * @param next
     */
    getQuery: function (req, res, next) {
        var urlUtils = new UrlUtils(req, ['db']);

        res.render('db-query', {
            layout: 'layouts/default',
            pages: textUtils.filterMenu(access['app-menus']['db'], req.user.userType, req.user.userGroups),
            product: config['product'],
            home: urlUtils.getHost(),
            user: req.user
        });

    },
    /**
     * Browser based interface to test queries
     *
     * route: POST /insert
     *
     * req: DB
     * req: collection
     * req: query - JSON string containing query
     * req: projection -JSON string containing projection
     *
     * @param rq
     * @param res
     * @param next
     */
    postQuery: function (req, res, next) {

        /*
         * Init vars and get data from req
         */
        var urlUtils = new UrlUtils(req, ['db']);
        var dbName = req.body['db'];
        var collectionName = req.body['collection'];
        var query = parseUnknown(req.body['query']);
        var projection = parseUnknown(req.body['projection']);
        var pipeline = parseUnknown(req.body['pipeline']);
        var distinct = notEmpty(req.body['distinct']);

        /**
         *
         * @param err
         * @param docs
         */
        var callback = function (err, docs) {
            if (err) {
                if (req.xhr) {
                    res.status(500).json({error: 'Query Failed'});
                } else {
                    next(err);
                }
            } else {
                var results = JSON.stringify(docs, null, 4);
                console.log('Found : ' + docs.length);

                res.render('db-results', {
                    layout: 'layouts/default',
                    pages: textUtils.filterMenu(access['app-menus']['db'], req.user.userType, req.user.userGroups),
                    product: config['product'],
                    home: urlUtils.getHost(),
                    user: req.user,
                    results: results,
                    count: Object.keys(docs).length
                });
            }
        };

        /*
         * Perform different queries based on POST values
         */
        if (query) {
            if (projection === null) projection = {};
            console.log('Query: ' + JSON.stringify(query));
            console.log('Projection: ' + JSON.stringify(projection));

            //Sucky MongoDB thing
            //convert _id to object
            if (typeof query['_id'] !== 'undefined') {
                query['_id'] = mongo.convertToObjectId(query['_id']);
            }

            console.log('Query : ' + req.body['query']);
            mongo.query(dbName, collectionName, query, projection, callback);

        } else if (pipeline) {

            console.log('Pipeline: ' + JSON.stringify(pipeline));
            mongo.aggregateQuery(dbName, collectionName, pipeline, callback);

        } else if (distinct) {
            console.log('Distinct: ' + distinct);
            mongo.distinctQuery(dbName, collectionName, distinct, callback);

        } else {
            res.render('db-results', {
                layout: 'layouts/default',
                pages: textUtils.filterMenu(access['app-menus']['db'], req.user.userType, req.user.userGroups),
                product: config['product'],
                home: urlUtils.getHost(),
                user: req.user,
                results: JSON.stringify([{"message": "Fill in the fields next time ;)"}], null, 4),
                count: 0
            });
        }
    }
};
