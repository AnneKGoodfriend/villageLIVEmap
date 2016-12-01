//blue map marker
var blueIcon = L.icon({
	iconUrl: 'https://s3-us-west-2.amazonaws.com/villagelive1/bluepin.png',
	shadowUrl: 'https://s3-us-west-2.amazonaws.com/villagelive1/bluepin.png',
	iconSize:     [26, 30], // size of the icon
	shadowSize:   [26, 30], // size of the shadow
	iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
	shadowAnchor: [22, 94],  // the same for the shadow
	popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

//pink map marker
var pinkIcon = L.icon({
	iconUrl: 'https://s3-us-west-2.amazonaws.com/villagelive1/pinkpin.png',
	shadowUrl: 'https://s3-us-west-2.amazonaws.com/villagelive1/pinkpin.png',
	iconSize:     [26, 30], // size of the icon
	shadowSize:   [26, 30], // size of the shadow
	iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
	shadowAnchor: [22, 94],  // the same for the shadow
	popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


//mapbox background
var mapbackground = L.tileLayer('https://api.mapbox.com/styles/v1/annekgoodfriend/ciw2fcl6200502kr3zr3a3cnl/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5uZWtnb29kZnJpZW5kIiwiYSI6ImNpdmxxNTh4dzBlMXUzM21xcDlhajRna2QifQ.yD0FIvUUIqgKpsoVXMl_QA', {
	maxZoom: 16,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'mapbox.streets'
});

// the actual map
var mymap = L.map('mapid')
	.setView([40.725, -73.998], 14)
	.addLayer(mapbackground);