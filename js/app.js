//Model
//List of initial locations to be dispalyed on map
var initialLocations = [{
 title: 'Ardenwood Historic Farm',
 location: {
  lat: 37.556817,
  lng: -122.048231
 },
 id: '4ac7bbfdf964a52075b920e3'
}, {
 title: 'Lake Elizabeth Park',
 location: {
  lat: 37.543634,
  lng: -121.962885
 },
 id: '4ade0492f964a520696721e3'
}, {
 title: "Children's Discovery Museum",
 location: {
  lat: 37.326755,
  lng: -121.89252
 },
 id: '428a8580f964a52098231fe3'
}, {
 title: 'Niles Canyon Railway',
 location: {
  lat: 37.578259,
  lng: -121.980858
 },
 id: '4b3808b8f964a5209b4a25e3'
}, {
 title: "California's Great America",
 location: {
  lat: 37.398421,
  lng: -121.975126
 },
 'id': '46ab758cf964a5206d491fe3'
}];

//View Model for the app
var mapViewModel = function(map) {
  //Create an observable array
  locations = ko.observableArray(initialLocations);

  //Display initial locations
  //Create a new blank array for initial listing markers
  var markers = [];

  //Initialize a google map marker infowindow
  var infoWindow = new google.maps.InfoWindow();

  //Loop through the initial locations
  for (var i = 0; i < initialLocations.length; i++) {
   //Create a marker for every location
   var marker = new google.maps.Marker({
    map: map,
    position: initialLocations[i].location,
    title: initialLocations[i].title,
    animation: google.maps.Animation.DROP,
    id: i
   });
   //Push the marker into the markers array defined earlier
   markers.push(marker);


   //Call the foursquare API through this function to get venue details
   getLocationDetails(initialLocations[i]);

   //Onclick event for the marker to open an infowindow and bounce animation
   marker.addListener('click', function() {
    toggleAnimation(this);
    populateInfoWindow(this, infoWindow);
   });

   //Function to toggle animation
   function toggleAnimation(marker) {
    if (marker.getAnimation() !== null) {
     marker.setAnimation(null);
    } else {
     marker.setAnimation(google.maps.Animation.BOUNCE);
     setTimeout(function() {
      marker.setAnimation(null);
     }, 1400); // stop after 2 bounces
    }
   }

   //Function to populate the marker infowindow
   function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
     infowindow.marker = marker;
     infoWindow.setContent(marker.content);
     infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
     });
    }
    //Bugfix: Moved out of if condition
    //Issue: After closing infowindow manually, it does not open until
    //another marker is clicked and its infowindow opens.
    infowindow.open(map, marker);
   }
   //Attach the created marker to the corresponding location
   initialLocations[i].marker = marker;
  } //End marker loop

  //Function to identify the clicked KO place and associate it to a marker
  //Handle exception when no data in markers array or when no matched marker
  highlightMarker = function(title) {
   if (markers.length > 0) {
    markerToHighlight = markers.filter(marker => marker.title == title);
    if (markerToHighlight.length > 0) {
     toggleAnimation(markerToHighlight[0]);
    } else {
     console.log('No marker found');
    }
   } else {
    console.log('No marker found');
   }
  };

  //Initialize KO Observable used in search bar
  searchText = ko.observable('');

  //KO Computed function that uses search text and filters the location list
  finalLocations = ko.computed(function() {
   var filter = searchText().toLowerCase();
   if (filter) {
    return ko.utils.arrayFilter(locations(), function(location) {
     isFiltered = location.title.toLowerCase().indexOf(filter) >= 0;
     //Set markers to be visible if it matches filter
     if (isFiltered == true) {
      location.marker.setVisible(true);
     } else {
      infoWindow.close();
      location.marker.setVisible(false)
     };
     return isFiltered;
    });
   } else {
    //Resets all the markers' visbility to true
    locations().forEach(function(location) {
     location.marker.setVisible(true);
    });
    return locations();
   }
  });

  /**Function to get location details from foursquare based on venue id
  Upon reveiving data successfuly, content for infowindow is formatted,
  Infowindow content if the location's marker is set.
  In case of any errors, the location's already stored title is set as content.
  */
  function getLocationDetails(location) {
   var content = '';
   var foursquareURL = 'https://api.foursquare.com/v2/venues/' + location.id + '?client_id=DYF04AFYSLBTJJW3LETD0T20KEO1SLAVVI1O2PUNLNC3RI3L&client_secret=OYC3Q12PKHHY5T4UIPWMCLP5J5W1FNBEEVR3PHKYO2JPS3N4&v=20170904';
   $.getJSON(foursquareURL)
    .done(function(data) {
     var title = data.response.venue.name;
     var address = data.response.venue.location.formattedAddress;
     var formattedAddress = '';
     for (var i = 0; i < address.length; i++) {
      formattedAddress += address[i];
      formattedAddress += (i < (address.length) - 1) ? ', ' : '.';
     }
     var url = data.response.venue.url ? data.response.venue.url : '';
     var urlText = url == '' ? 'URL: Not Available' : url
     content = '<h4><font color="green">' + title + '</font></h4>' +  '<p>Address: ' + formattedAddress + '</p>' +  '<p><a href="' + url + '">' +       urlText + '</a></p>';
     location.marker.content = content;
    }).fail(function(e) {
     content = '<div>' + location.title + '</div>';
     location.marker.content = content;
    });
  }; //End of foursquare function
 } //End of view model

//View
//error function to display an alert to user for google map api errors.
function mapError() {
 window.alert('Could not load the Google Map');
}

function initMap() {
 var map = new google.maps.Map(document.getElementById('map'), {
  zoom: 10,
  center: {
   lat: 37.54827,
   lng: -121.988572
  }
 });
 ko.applyBindings(new mapViewModel(map));

 /**Responsive layout
 Hamburger bootstrap glyph button used to resize the map and search panel
 Google map resize event called as changing css property, class on css was not reflecting map size change
 jQuery used to manipulate layout changes
 */
 $('#hamburger').click(function() {
  if ($('#search-panel').is(':visible')) {
   $('#search-panel').removeClass('col-xs-4');
   $('#search-panel').hide();
   $('#map').removeClass('col-xs-8');
   $('#map').addClass('col-xs-12');
   $('#map').css('width', '100%');
   google.maps.event.trigger(map, 'resize');

  } else {
   $('#search-panel').show();
   $('#map').removeClass('col-xs-12');
   $('#map').addClass('col-xs-8');
   $('#map').css('width', '');
   google.maps.event.trigger(map, 'resize')
   $('#search-panel').addClass('col-xs-4');
  }
 });
} //End of view