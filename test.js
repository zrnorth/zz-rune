// test file for aws

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'}); // AWS for node doesn't set region by default
var dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

dynamo.listTables({}, function(err, data) {
    if (err) console.log(err, err.stack);
    else     console.log(data);
});
