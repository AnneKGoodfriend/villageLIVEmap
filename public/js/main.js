// CUSTOM JS FILE //

var usermapmarkers = new L.FeatureGroup();
var nelsonmapmarkers = new L.FeatureGroup();

var nelsondisplay=true;
var userdisplay=true;


function init() {
  // and render  markers on the map
  renderPlaces();
}

//image upload sw3 ???
// var fd = new FormData();

// // pull out the file
// fd.append( 'image', $('input[type=file]')[0].files[0] );

// $.ajax({
//   url: '/api/create'
//   data: fd,
//   processData: false,
//   contentType: false,
//   type: 'POST',
//   success: function(data){
//     alert(data);
//   }
// });

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


// get data
// loop through and populate the map with markers
var renderPlaces = function() {

	//Nelson Json Stuff
	var promise = $.getJSON('/data/vids2.json');
		promise.then(function(response) {
				
				   // console.log(response)
			for(var i=0;i<response.length;i++){
				   	
				var d = {
				   	 lat : parseFloat(response[i].lat) - parseFloat(.004),
				   	 long : parseFloat(response[i].long) +parseFloat(.001),
				   	 title : response[i].title,
				   	 loc : response[i].location,
				   	 embed : response[i].youtubeembed,
				}
				   	// console.log(nelsonmarkers);

				var mapmarker = L.marker([d.lat, d.long], {icon: blueIcon})
					mapmarker.bindPopup('<b>'+ d.loc + ' </b> <br>' + d.title + '<br>' + d.embed)
					.openPopup();
					// console.log(mapmarker);
					
				//push to FeatureGroup as layer
				nelsonmapmarkers.addLayer(mapmarker);
				// console.log(nelsonmapmarkers);
				}
				     
			});
		// grouped markers
		mymap.addLayer(nelsonmapmarkers);
				


	//Mongodb stuff
	jQuery.ajax({
		url : '/api/get',
		dataType : 'json',
		success : function(response) {

			// console.log(response);
			contributions = response.contribution;
			// now, loop through the memories and add them as markers to the map
			for(var i=0;i<contributions.length;i++){

				var d = {
					lat : parseFloat(contributions[i].location.geo[1]) - parseFloat(.004),
				   	lng : parseFloat(contributions[i].location.geo[0]) + parseFloat(.001),
					url : contributions[i].url,
					memory: contributions[i].memory,
					name: contributions[i].name,
					loc: contributions[i].location.name
				}
				// console.log(markers);

				 if (d.url != 'undefined'){
					var photo = '<img class="url" src="'+d.url+'" style="width:300px; padding: 5px;">'}else{ photo = '<img class="url" src="https://s3-us-west-2.amazonaws.com/villagelive1/noimageavailable.png" style="width:200px; padding: 5px;">'};

				var mapmarker = L.marker([d.lat, d.lng], {icon: pinkIcon})
					mapmarker.bindPopup(photo + ' <br> <b>' +d.memory + "</b> <br>"+d.name+" <br>" + d.loc).openPopup();
					// console.log(mapmarker);
					
				//push to FeatureGroup as layer
				usermapmarkers.addLayer(mapmarker);
				// console.log(nelsonmapmarkers);

				}
			// grouped markers
			renderContributions(contributions);
		}
	})

	mymap.addLayer(usermapmarkers);
};

function renderContributions(contribution){

	// first, make sure the #memory-holder is empty
	jQuery('#contribution-holder').empty();

	// loop through all the memorys and add them in the memory-holder div
	for(var i=0;i<contribution.length;i++){
		var htmlToAdd = '<div class="col-md-4 contribution" id="individualpost">'+
			'<img class="url" src="'+contribution[i].url+'" style="width:200px; padding: 5px;">'+
			'<h1 class="name">'+contribution[i].memory+'</h1>'+
			'<p>Name: <span class="name">'+contribution[i].name+'</span><br>'+
			'Location: <span class="location">'+contribution[i].location.name+'</span><br>'+
			'Tags: <span class="tags">'+contribution[i].tags+'</span><br>'+
		'</div>';

		jQuery('#contribution-holder').prepend(htmlToAdd);
	}
}

//toggle nelson button and layers
$(nelsonbutton).click(function() {
    if (nelsondisplay==true){
	    mymap.removeLayer(nelsonmapmarkers)	    
		$(this).addClass("mapButtonActive");
	    nelsondisplay=false;
    }else {
	    mymap.addLayer(nelsonmapmarkers)
	    $(this).removeClass("mapButtonActive");
	    nelsondisplay=true;
    }
    var type = $(this).attr("class"); 
   // console.log(type); 
});

//toggle user button and layers
$(userbutton).click(function() {
    if (userdisplay==true){
	    mymap.removeLayer(usermapmarkers);
		$(this).addClass("mapButtonActive");
	    userdisplay=false;
    }else {
	    mymap.addLayer(usermapmarkers);
	    $(this).removeClass("mapButtonActive");
	    userdisplay=true;
	    console.log(userdisplay);
    }
    var type = $(this).attr("class"); 
   // console.log(type); 

});

window.addEventListener('load',init);