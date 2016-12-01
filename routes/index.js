var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); // mongoDB library
var geocoder = require('geocoder'); // geocoder library

// our db model
var Contribution = require("../models/model.js");


// S3 File dependencies
var AWS = require('aws-sdk');
var awsBucketName = process.env.AWS_BUCKET_NAME;
var s3Path = process.env.AWS_S3_PATH; // TODO - we shouldn't hard code the path, but get a temp URL dynamically using aws-sdk's getObject
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
var s3 = new AWS.S3();

// file processing dependencies
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {

  res.render('about.html');
  
  // var jsonData = {
  // 	'name': 'village-live-map',
  // 	'api-status':'OK'
  // }

  // // respond with json data
  // res.json(jsonData)
});

router.get('/about', function(req,res){
  res.render('about.html');
})

router.get('/explore', function(req,res){
  res.render('explore.html');
})

// simple route to show the survey html
router.get('/survey', function(req,res){
  res.render('survey.html');
})



// /**
//  * POST '/api/create'
//  * Receives a POST request of the new user and location, saves to db, responds back
//  * @param  {Object} req. An object containing the different attributes of the Person
//  * @return {Object} JSON
//  */

router.post('/api/create', function(req, res){

    console.log('the data we received is --> ')
    console.log(req.body);

    
    // pull out the information from the req.body
    var name = req.body.name;
    var age = req.body.age;
    var tags = req.body.tags.split(","); // split string into array
    var memory = req.body.memory;
    var url = req.body.url;
    var location = req.body.location;
    var email = req.body.email;

    // hold all this data in an object
    // this object should be structured the same way as your db model
    var contributionObj = {
      name: name,
      age: age,
      tags: tags,
      memory: memory,
      url: url,
      email: email
    };

    // if there is no location, return an error
    if(!location) return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})

    // now, let's geocode the location
    geocoder.geocode(location, function (err,data) {


      // if we get an error, or don't have any results, respond back with error
      if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
        var error = {status:'ERROR', message: 'Error finding location'};
        return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})
      }

      // else, let's pull put the lat lon from the results
      var lon = data.results[0].geometry.location.lng;
      var lat = data.results[0].geometry.location.lat;

      // now, let's add this to our memory  object from above
      contributionObj.location = {
        geo: [lon,lat], // need to put the geo co-ordinates in a lng-lat array for saving
        name: data.results[0].formatted_address // the location name
      }

      // now, let's save it to the database
      // create a new memory  model instance, passing in the object we've created
      var contribution = new Contribution(contributionObj);

      // now, save that memory  instance to the database
      // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save    
      contribution.save(function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error saving memory'};
          return res.json(error);
        }

        console.log('saved a memory!');
        console.log(data);

        // now return the json data of the new memory 
        var jsonData = {
          status: 'OK',
          contribution: data
        }

        return res.json(jsonData);

      }) 

    }); 
});

// /**
//  * GET '/api/get/:id'
//  * Receives a GET request specifying the memory  to get
//  * @param  {String} req.param('id'). The memory Id
//  * @return {Object} JSON
//  */

router.get('/api/get/:id', function(req, res){

  var requestedId = req.param('id');

  // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findById
  Contribution.findById(requestedId, function(err,data){

    // if err or no user found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that memory '};
       return res.json(error);
    }

    // otherwise respond with JSON data of the memory 
    var jsonData = {
      status: 'OK',
      contribution: data
    }

    return res.json(jsonData);
  
  })
})

// /**
//  * GET '/api/get'
//  * Receives a GET request to get all memory  details
//  * @return {Object} JSON
//  */


// S3 - S3 - S3 - S3 - S3 - S3 - S3 - S3
router.post('/api/create/image', multipartMiddleware, function(req,res){

  console.log('the incoming data >> ' + JSON.stringify(req.body));
  console.log('the incoming image file >> ' + JSON.stringify(req.files.image));

  // var personObj = {
  //   name: req.body.name,
  //   itpYear: req.body.itpYear,
  //   interests: req.body.interests.split(','),
  //   link: req.body.link,
  //   slug : req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')
  // }

  var contributionObj = {
      name: req.body.name,
      age: req.body.age,
      tags: req.body.tags,
      memory: req.body.memory,
      url: req.body.url,
      email: req.body.email
    };


  // NOW, we need to deal with the image
  // the contents of the image will come in req.files (not req.body)
  var filename = req.files.image.name; // actual filename of file
  var path = req.files.image.path; // will be put into a temp directory
  var mimeType = req.files.image.type; // image/jpeg or actual mime type

  // create a cleaned file name to store in S3
  // see cleanFileName function below
  var cleanedFileName = cleanFileName(filename);

  // We first need to open and read the uploaded image into a buffer
  fs.readFile(path, function(err, file_buffer){

    // reference to the Amazon S3 Bucket
    var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});

    // Set the bucket object properties
    // Key == filename
    // Body == contents of file
    // ACL == Should it be public? Private?
    // ContentType == MimeType of file ie. image/jpeg.
    var params = {
      Key: cleanedFileName,
      Body: file_buffer,
      ACL: 'public-read',
      ContentType: mimeType
    };

    // Put the above Object in the Bucket
    s3bucket.putObject(params, function(err, data) {
      if (err) {
        console.log(err)
        return;
      } else {
        console.log("Successfully uploaded data to s3 bucket");

        // now that we have the image
        // we can add the s3 url our person object from above
        contributionObj['imageUrl'] = s3Path + cleanedFileName;

        // now, we can create our person instance
        var place = new Place(contributionObj);

        place.save(function(err,data){
          if(err){
            var error = {
              status: "ERROR",
              message: err
            }
            return res.json(err)
          }

          var jsonData = {
            status: "OK",
            place: data
          }

          return res.json(jsonData);        
        })

      }

    }); // end of putObject function

  });// end of read file
})

function cleanFileName (filename) {

    // cleans and generates new filename for example userID=abc123 and filename="My Pet Dog.jpg"
    // will return "abc123_my_pet_dog.jpg"
    var fileParts = filename.split(".");

    //get the file extension
    var fileExtension = fileParts[fileParts.length-1]; //get last part of file

    //add time string to make filename a little more random
    d = new Date();
    timeStr = d.getTime();

    //name without extension
    newFileName = fileParts[0];

    return newFilename = timeStr + "_" + fileParts[0].toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_') + "." + fileExtension;

}






router.get('/api/get', function(req, res){

  // mongoose method to find all, see http://mongoosejs.com/docs/api.html#model_Model.find
  Contribution.find(function(err, data){
    // if err or no memories found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find entry'};
      return res.json(error);
    }

    // otherwise, respond with the data 

    var jsonData = {
      status: 'OK',
      contribution: data
    } 

    res.json(jsonData);

  })

})

// /**
//  * POST '/api/update/:id'
//  * Receives a POST request with data of the memory  to update, updates db, responds back
//  * @param  {String} req.param('id'). The memory Id to update
//  * @param  {Object} req. An object containing the different attributes of the memory 
//  * @return {Object} JSON
//  */

router.post('/api/update/:id', function(req, res){

   var requestedId = req.param('id');

   var dataToUpdate = {}; // a blank object of data to update

    // pull out the information from the req.body and add it to the object to update
    var name, age, memory, url, location; 

    // we only want to update any field if it actually is contained within the req.body
    // otherwise, leave it alone.
    if(req.body.name) {
      name = req.body.name;
      // add to object that holds updated data
      dataToUpdate['name'] = name;
    }
    if(req.body.age) {
      age = req.body.age;
      // add to object that holds updated data
      dataToUpdate['age'] = age;
    }
    if(req.body.memory) {
      memory = req.body.memory;
      // add to object that holds updated data
      dataToUpdate['memory'] = memory;
    }
    if(req.body.url) {
      url = req.body.url;
      // add to object that holds updated data
      dataToUpdate['url'] = url;
    }

    var tags = []; // blank array to hold tags
    if(req.body.tags){
      tags = req.body.tags.split(","); // split string into array
      // add to object that holds updated data
      dataToUpdate['tags'] = tags;
    }

    if(req.body.location) {
      location = req.body.location;
    }

    // if there is no location, return an error
    if(!location) return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})

    if(req.body.email) {
      email = req.body.email;
    }

    // now, let's geocode the location
    geocoder.geocode(location, function (err,data) {


      // if we get an error, or don't have any results, respond back with error
      if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
        var error = {status:'ERROR', message: 'Error finding location'};
        return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})
      }

      // else, let's pull put the lat lon from the results
      var lon = data.results[0].geometry.location.lng;
      var lat = data.results[0].geometry.location.lat;

      // now, let's add this to our memory  object from above
      dataToUpdate['location'] = {
        geo: [lon,lat], // need to put the geo co-ordinates in a lng-lat array for saving
        name: data.results[0].formatted_address // the location name
      }

      console.log('the data to update is ' + JSON.stringify(dataToUpdate));

      // now, update that memory 
      // mongoose method findByIdAndUpdate, see http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  
      Contribution.findByIdAndUpdate(requestedId, dataToUpdate, function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error updating memory '};
          return res.json(error);
        }

        console.log('updated the memory !');
        console.log(data);

        // now return the json data of the new person
        var jsonData = {
          status: 'OK',
          contribution: data
        }

        return res.json(jsonData);

      })

    });     

})

/**
 * GET '/api/delete/:id'
 * Receives a GET request specifying the memory  to delete
 * @param  {String} req.param('id'). The memory Id
 * @return {Object} JSON
 */

router.get('/api/delete/:id', function(req, res){

  var requestedId = req.param('id');

  // Mongoose method to remove, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
 Contribution.findByIdAndRemove(requestedId,function(err, data){
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that memory  to delete'};
      return res.json(error);
    }

    // otherwise, respond back with success
    var jsonData = {
      status: 'OK',
      message: 'Successfully deleted id ' + requestedId
    }

    res.json(jsonData);

  })

})

module.exports = router;