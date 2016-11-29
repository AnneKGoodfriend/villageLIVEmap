// CUSTOM JS FILE //
// var map; // global map variable
var markers = []; // array to hold map markers

function init() {
  
  // set some default map details, initial center point, zoom and style
  // var mapOptions = {
  //   center: new google.maps.LatLng(40.733404, -74.001750), // NYC
  //   zoom: 16,
  //   mapTypeId: google.maps.MapTypeId.ROADMAP
  // };
  
  // // create the map and reference the div#map-canvas container
  // map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  // get the animals (ajax) 
  // and render them on the map
  renderPlaces();
}

jQuery("#addForm").submit(function(e){

	// first, let's pull out all the values
	// the name form field value
	var name = jQuery("#name").val();
	var age = jQuery("#age").val();
	var tags = jQuery("#tags").val();
	var memory = jQuery("#memory").val();
	var url = jQuery("#url").val();
	var location = jQuery("#location").val();
	var email = jQuery("#email").val();

		// make sure we have a location
	if(!location || location=="") return alert('We need a location!');

	// POST the data from above to our API create route
  jQuery.ajax({
  	url : '/api/create',
  	dataType : 'json',
  	type : 'POST',
  	encrypt: 'multipart/form-data',
  	// we send the data in a data object (with key/value pairs)
  	data : {
  		name : name,
  		age : age,
  		tags : tags,
  		memory: memory,
  		url : url,
  		location : location,
  		email: email
  	},
  	success : function(response){
  		if(response.status=="OK"){
	  		// success
	  		console.log(response);
	  		// re-render the map
	  		renderPlaces();
	  		// now, clear the input fields
	  		jQuery("#addForm input").val('');
  		}
  		else {
  			alert("something went wrong, it's possible google did not recogize the address you entered");
  		}
  	},
  	error : function(err){
  		// do error checking
  		alert("something went wrong, it's possible google did not recogize the address you entered");
  		console.error(err);
  	}
  });

	// prevents the form from submitting normally
  e.preventDefault();
  return false;

});


// get Animals JSON from /api/get
// loop through and populate the map with markers
var renderPlaces = function() {
	// var infowindow =  new google.maps.InfoWindow({
	//     content: ''
	// });


	//Nelson Json Stuff
	var promise = $.getJSON('/data/vids2.json');
				promise.then(function(response) {
				    //do a bunch of stuff here
				    console.log(response)


				   for(var i=0;i<response.length;i++){
				   	
				   	var lat = response[i].lat;
				   	var long = response[i].long;
				   	var title = response[i].title;
				   	var embed = response[i].youtubeembed;
				   	console.log(lat);
				   	console.log(long);
				   	console.log(title);

				   	// var nelsonmarkers = 
				   	L.marker([response[i].lat, response[i].long], {icon: blueIcon})
					.addTo(mymap)
					.bindPopup(response[i].title + '<br>' + embed).openPopup();
				   }



				     
				});



	jQuery.ajax({
		url : '/api/get',
		dataType : 'json',
		success : function(response) {

			// var promise = $.getJSON('/api/get');
			// 	promise.then(function(response) {
				    //do a bunch of stuff here
				//     console.log(data) // take a look at the data in the console
				// });

			// var userMemories = L.geoJson(data, {
   //           filter: usermemory;
			// });

			console.log(response);
			contributions = response.contribution;
			// first clear any existing markers, because we will re-add below
			clearMarkers();
			markers = [];

			// now, loop through the memories and add them as markers to the map
			for(var i=0;i<contributions.length;i++){

				var latLng = {
					lat: contributions[i].location.geo[1], 
					lng: contributions[i].location.geo[0]
				}

				// make and place map maker.
				// var marker = new google.maps.Marker({
				//     map: map,
				//     position: latLng,
				// });

				// var findphoto = contributions[i].url;
				// console.log(findphoto);




				if (contributions[i].url != 'undefined'){
					var photo = '<img class="url" src="'+contributions[i].url+'" style="width:300px; padding: 5px;">'}else{ photo = '<img class="url" src="https://s3-us-west-2.amazonaws.com/villagelive1/noimageavailable.png" style="width:200px; padding: 5px;">'};
					// console.log(photo);




				//leaflet stuff
				// userMemories.addTo(mymap)
				var memorymarkers = L.marker([contributions[i].location.geo[1], contributions[i].location.geo[0]], {icon: pinkIcon})
				.addTo(mymap)
				.bindPopup(photo + ' <br> <b>' +contributions[i].memory + "</b> <br>"+contributions[i].name+" <br>" + contributions[i].location.name)
				.openPopup();
		
				// bindInfoWindow(marker, map, infowindow, '<b>' +contributions[i].memory + "</b> <br>"+contributions[i].name+" <br>" + contributions[i].location.name);
				
				// keep track of markers
				// markers.push(marker);
			}

			// now, render the animal image/data
			renderContributions(contributions);

		}
	})
};

// edit form button event
// when the form is submitted (with a new animal edit), the below runs
jQuery("#editForm").submit(function(e){

	// first, let's pull out all the values
	// the name form field value
	var name = jQuery("#edit-name").val();
	var age = jQuery("#edit-age").val();
	var tags = jQuery("#edit-tags").val();
	var memory = jQuery("#edit-memory").val();
	var url = jQuery("#edit-url").val();
	var location = jQuery("#edit-location").val();
	var email = jQuery("#edit-email").val();
	var id = jQuery("#edit-id").val();

	// make sure we have a location
	if(!location || location=="") return alert('We need a location!');
     
  console.log(id);
      
	// POST the data from above to our API create route
  jQuery.ajax({
  	url : '/api/update/'+id,
  	dataType : 'json',
  	type : 'POST',
  	// we send the data in a data object (with key/value pairs)
  	data : {
  		name : name,
  		age : age,
  		tags : tags,
  		memory : memory,
  		url : url,
  		location : location,
  		email: email
  	},
  	success : function(response){
  		if(response.status=="OK"){
	  		// success
	  		console.log(response);
	  		// re-render the map
	  		renderPlaces();
	  		// now, close the modal
	  		$('#editModal').modal('hide')
	  		// now, clear the input fields
	  		jQuery("#editForm input").val('');
  		}
  		else {
  			alert("something went wrong");
  		}
  	},
  	error : function(err){
  		// do error checking
  		alert("something went wrong");
  		console.error(err);
  	}
  }); 

	// prevents the form from submitting normally
  e.preventDefault();
  return false;
});

// binds a map marker and infoWindow together on click
var bindInfoWindow = function(marker, map, infowindow, html) {
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(html);
        infowindow.open(map, marker);
    });
}

function renderContributions(contribution){

	// first, make sure the #animal-holder is empty
	jQuery('#contribution-holder').empty();

	// loop through all the animals and add them in the animal-holder div
	for(var i=0;i<contribution.length;i++){
		var htmlToAdd = '<div class="col-md-4 contribution" id="individualpost">'+
			'<img class="url" src="'+contribution[i].url+'" style="width:200px; padding: 5px;">'+
			'<h1 class="name">'+contribution[i].memory+'</h1>'+

			'<p>Name: <span class="name">'+contribution[i].name+'</span><br>'+
			'Location: <span class="location">'+contribution[i].location.name+'</span><br>'+
			// 'Age: <span class="age">'+contribution[i].age+'</span><br>'+
			'Tags: <span class="tags">'+contribution[i].tags+'</span><br>'+
			// '<p class="hide id">'+contribution[i]._id+'</p>'+

			// '<ul>'+
			// 	'<li>Location: <span class="location">'+contribution[i].location.name+'</span></li>'+
			// 	'<li>Name: <span class="memory">'+contribution[i].name+'</span></li>'+
			// 	'<li>Age: <span class="age">'+contribution[i].age+'</span></li>'+
			// 	'<li>Tags: <span class="tags">'+contribution[i].tags+'</span></li>'+
			// 	'<li class="hide id">'+contribution[i]._id+'</li>'+
			// '</ul>'
			// + '<button type="button" id="'+contribution[i]._id+'" onclick="deleteAnimal(event)">Delete Animal</button>'+
			// '<button type="button" data-toggle="modal" data-target="#editModal"">Edit Animal</button>'+
		'</div>';

		jQuery('#contribution-holder').prepend(htmlToAdd);

	}
}

jQuery('#editModal').on('show.bs.modal', function (e) {
  // let's get access to what we just clicked on
  var clickedButton = e.relatedTarget;
  // now let's get its parent
	var parent = jQuery(clickedButton).parent();

  // now, let's get the values of the pet that we're wanting to edit
  // we do this by targeting specific spans within the parent and pulling out the text
  var name = $(parent).find('.name').text();
  var age = $(parent).find('.age').text();
  var tags = $(parent).find('.tags').text();
  var memory = $(parent).find('.memory').text();
  var url = $(parent).find('.url').attr('src');
  var location = $(parent).find('.location').text();
  var email = $(parent).find('.email').text();
  var id = $(parent).find('.id').text();

  // now let's set the value of the edit fields to those values
 	jQuery("#edit-name").val(name);
	jQuery("#edit-age").val(age);
	jQuery("#edit-tags").val(tags);
	jQuery("#edit-memory").val(memory);
	jQuery("#edit-url").val(url);
	jQuery("#edit-location").val(location);
	jQuery("#edit-email").val(email);
	jQuery("#edit-id").val(id);

})


function deleteContribution(event){
	var targetedId = event.target.id;
	console.log('the animal to delete is ' + targetedId);

	// now, let's call the delete route with AJAX
	jQuery.ajax({
		url : '/api/delete/'+targetedId,
		dataType : 'json',
		success : function(response) {
			// now, let's re-render the animals

			renderPlaces();

		}
	})

	event.preventDefault();
}

function clearMarkers(){
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null); // clears the markers
  }	
}

// when page is ready, initialize the map!
google.maps.event.addDomListener(window, 'load', init);


//window.addEventListener('load',init);






