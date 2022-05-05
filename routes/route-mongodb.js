
/**
 * Created by awilcox on 11/05/2015.
 */

var routeMongoDB = require('../models/route-mongodb-callbacks');
var express = require('express');
var router = express.Router();
/**
 * Base routes
 * @param app
 * @param pass
 */
module.exports = function(app, pass) {


    router.get('/db', pass.ensureAuthenticated, routeMongoDB.getRoot);

    router.get('/dbapi',pass.ensureAuthenticated, routeMongoDB.getApi);
    router.get('/dbapi/:database', pass.ensureAuthenticated, routeMongoDB.getAPICollections);
    router.get('/dbapi/:database/:collection', pass.ensureAuthenticated, routeMongoDB.getAPISchema);
    router.get('/dbapi/:database/:collection/distinct/:field', pass.ensureAuthenticated, routeMongoDB.getAPIDistinct);
    router.get('/dbapi/:database/:collection/:field/:value', pass.ensureAuthenticated,routeMongoDB.getAPIDocuments);
    router.post('/dbapi/:database/:collection/query',pass.ensureAuthenticated, routeMongoDB.postAPIQuery);
    
    router.post('/dbapi/:database/:collection', routeMongoDB.postAPIInsert);
    router.put('/dbapi/:database/:collection',pass.ensureAuthenticated, routeMongoDB.putAPIUpdateDoc);
    router.delete('/dbapi/:database/:collection', pass.ensureAuthenticated, routeMongoDB.deleteAPIDropCollection);
    router.delete('/dbapi/:database/:collection/documents',pass.ensureAuthenticated, routeMongoDB.deleteAPIDeleteDocs);

     /* interface for the web */
    router.get('/db/insert',pass.ensureAuthenticated, routeMongoDB.getInsert);
    router.post('/db/insert',pass.ensureAuthenticated, routeMongoDB.postInsert);

    /*interface for the web */
    router.get('/db/query',pass.ensureAuthenticated, routeMongoDB.getQuery);
    router.post('/db/query',pass.ensureAuthenticated, routeMongoDB.postQuery);

    /*interface for the web */
    router.get('/db/delete',pass.ensureAuthenticated, routeMongoDB.getDelete);

    /*interface fo r the web */
    router.get('/db/update', pass.ensureAuthenticated, routeMongoDB.getUpdate);

    app.use('/', router);
};
