/**
 * Created by awilcox on 15/07/2015.
 */

var mongo = require('../utils/mongo-connect');
var utils = require('../utils/utils');

/*
test for filename or return default
 */
var parseFilename = function (filename) {

    if (typeof filename === 'undefined') {
        return "export.csv";
    }
    return filename;
};


module.exports = {
    /**
     *
     * @param req
     * @param res
     * @param next
     */
    getExportDatabase: function (req, res, next) {
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];
        var filename = parseFilename(req.query['filename']);
        var queryParams = utils.filterObj(req.query,['filename']);

        var callback = function (err, docs) {
            if (err) {
                res.status(500).end();
                console.error(err);
            } else {
                res.attachment(filename);
                res.status(200).send(utils.toCSV(docs));
            }
        };

        //Have default query ? last 30 days ?

        mongo.query(dbName, collectionName, queryParams, {}, callback);

    },
    /**
     *
     * @param req
     * @param res
     * @param next
     */
    postExportDatabase: function (req, res, next) {
        var dbName = req.params['database'];
        var collectionName = req.params['collection'];
        var filename = parseFilename(req.body['filename']);
        var query = utils.parseUnknown(req.body['query']);
        var pipeline = utils.parseUnknown(req.body['pipeline']);

        var callback = function (err, docs) {
            if(err) {
                res.status(500).end();
                console.error(err);
            } else {
                console.log('Exporting Query');
                res.attachment(filename);
                res.status(200).send(utils.toCSV(docs));
            }

        };

        if(query) {
            mongo.query(dbName, collectionName, query, {}, callback);
        } else if (pipeline) {
            mongo.aggregateQuery(dbName, collectionName, pipeline, callback);
        }else {
            res.status(500).end();
        }

    }
};