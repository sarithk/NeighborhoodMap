//Model
//List of initial locations to be dispalyed on map
var initialLocations = [
{title: 'Ardenwood Historic Farm', location:{lat:37.556817, lng:-122.048231}},
{title: 'Lake Elizabeth Park', location:{lat:37.543634, lng:-121.962885}},
{title: "Children's Discovery Museum", location:{lat:37.326755, lng:-121.89252}},
{title: 'Niles Canyon Railway', location:{lat:37.578259, lng:-121.980858}},
{title: "California's Great America", location:{lat:37.398421, lng:-121.975126}}
];

//View Model for the app
var mapViewModel = function(map) {
      //Create an observable array
       locations = ko.observableArray(initialLocations);

     //Display initial locations
     //Create a new blank array for initial listing markers
     var markers = [];

     //Loop through the initial locations
     for ( var i = 0; i < initialLocations.length; i ++ ) {
     //Create a marker for every location
        var marker = new google.maps.Marker({
            map: map,
            position: initialLocations[i].location,
            title: initialLocations[i].title,
            animation: google.maps.Animation.DROP,
            id:i
        });
     //Push the marker into the markers array defined earlier
       markers.push(marker);
       //console.log(markers.length,marker);

       //Initialize a google map marker infowindow
       var infoWindow = new google.maps.InfoWindow();

       //Onclick event for the marker to open an infowindow and bounce animation
       marker.addListener('click', function(){
        toggleAnimation(this);
        populateInfoWindow(this, infoWindow);
       });

       //Function to toggle animation
       function toggleAnimation(marker) {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){ marker.setAnimation(null); }, 1400);  // stop after 2 bounces
        }
        }

       //Function to populate the marker infowindow
       function populateInfoWindow(marker, infowindow){
        if(infowindow.marker!=marker){
          infowindow.marker=marker;
          infoWindow.setContent('<div>'+marker.title+'</div>');
          infowindow.open(map,marker);
          infowindow.addListener('closeclick', function(){
          infowindow.marker = null;
          });
        }
      }

   }//End marker loop

//Function to identify the clicked KO place and associate it to a marker
//Handle exception when no data in markers array or when no matched marker
      highlightMarker = function (title){
        if(markers.length>0){
          markerToHighlight = markers.filter(marker => marker.title == title);
          if(markerToHighlight.length>0){
          toggleAnimation(markerToHighlight[0]);
        }
        else{
          console.log("No marker found");
        }
        }
        else{
          console.log("No marker found");
        }
      };

    }//End of view model

//error function to display an alert to user for google map api errors.
function mapError(){
  window.alert("Could not load the Google Map");
}

function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 10,
          center: {lat: 37.54827, lng: -121.988572}
        });
ko.applyBindings(new mapViewModel(map));
}
