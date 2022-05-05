/**
 * Created by awilcox on 15/07/2015.
 */
var express = require('express');
var router = express.Router();
var routeExport = require('../models/route-export-callbacks');

module.exports = function(app, pass) {

    router.get('/exportAPI/:database/:collection', pass.ensureAuthenticated, routeExport.getExportDatabase);
    router.post('/exportAPI/:database/:collection',pass.ensureAuthenticated, routeExport.postExportDatabase);
    app.use('/', router);
};
