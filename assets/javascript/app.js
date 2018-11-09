// ID for main container: main-content
// ID for start button: start-btn
// ID for thumbs up, thumbs down: thumbs-up, thumbs-down
// ID for loading image: loading-img
// ID for restaurant icon: food-img
// ID for winning restaurant image: result-img
// ID for forks that spin: fork-right, fork-left
// ID for final page: results
// ID for text on that page: results-directions
// Class of thumb buttons: thumbs

// Local variables go below this line
// ===================================================================================

var GoogleAPIkey = "AIzaSyA7b0Y8wH7Awthb9-CDlqAPtrr-Q2JCTVw";
var ZomatoAPIkey = "c30eca16c0c03ef51799b26e942490e3";

var ZomatoQuery = "https://cors-ut-bootcamp.herokuapp.com/https://developers.zomato.com/api/v2.1/search?";
// var ZomatoQuery = "https://developers.zomato.com/api/v2.1/search?q=franklins"

// $.ajax({
//   url: ZomatoQuery,
//   headers: {'user_key' : ZomatoAPIkey},
//   params: {q: 'franklins'}, 
//   method: "GET"}).then(function(response) {

//     console.log("I'm trying!");
//     console.log(response);

// })




// var GoogleQuery = "https://www.googleapis.com/geolocation/v1/geolocate?key=" + GoogleAPIkey;

// $.ajax({
//   url: GoogleQuery,
//   method : "POST"
// }).then(function(response) {

//   console.log(response);


// })

// Local functions go below this line.
// ======================================================================================

function StartButton () {};

function ipLookUp () {
  $.ajax('http://ip-api.com/json')
  .then(
      function success(response) {
          console.log('response: ', response);
          console.log('User\'s lat is: ', response.lat);
          console.log('User\'s long is: ', response.lon);
      },

      function fail(data, status) {
          console.log('Request failed.  Returned status of', status);
      }
  );
}

// Local execution code goes below this line
//=======================================================================================

$(document).ready(function() {});

// Firebase code and listeners go below this line
//=======================================================================================


// Initialize Firebase
var config = {
    apiKey: "AIzaSyCcVhov3nef0x8rAfCS2B4sps4RgA5-l3I",
    authDomain: "team1-project1.firebaseapp.com",
    databaseURL: "https://team1-project1.firebaseio.com",
    projectId: "team1-project1",
    storageBucket: "team1-project1.appspot.com",
    messagingSenderId: "221859996139"
  };

  firebase.initializeApp(config);

  // Variables for the connection, part provided by Firebase, part stored in the DB.
// var connectionsRef = database.ref("RPS/connections");
// var connectedRef = database.ref(".info/connected");
// var PersonalID = "";
var PersonalIDObj = "";


// When the client's connection state changes, push it to the local explicit connection monitor
connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        PersonalIDObj = connectionsRef.push(true);
        PersonalID = PersonalIDObj.path.n[2];

        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();

    }
    
});

// When the local connection monitor changes, decide whether to call the present player one, two, or nobody.
connectionsRef.on("value", function(snap) {

    var CurrentPlayers = snap.numChildren();

    if (CurrentPlayers === 1) {

        database.ref("RPS/Choices").remove();

        database.ref("RPS/gamestate").set({"state" : "wait"})

        if (LocalID !== "") {

            LocalID = "PlayerOne";

            clearInterval(CurrentTimer);

            SetPlayerOne();

        }

    }

    // Assign a local ID depending on the number of players
    if (LocalID === "") {
        // If there's ony one connection, make the current connection player 1
        if (CurrentPlayers === 1) {
            LocalID = "PlayerOne";
            SetPlayerOne();

        // If there are two connections, make the current connection player 2
        } else if (CurrentPlayers === 2) {

            LocalID = "PlayerTwo";
            SetPlayerTwo();

        // Otherwise, set the player to a non-participant.
        } else {
            LocalID = "NonParticipant";
            SetNonPlayer();
        }

    }

});




