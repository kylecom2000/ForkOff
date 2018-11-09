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

var LocalState = ""

function NotRun () {

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


var GoogleQuery = "https://www.googleapis.com/geolocation/v1/geolocate?key=" + GoogleAPIkey;

$.ajax({
  url: GoogleQuery,
  method : "POST"
}).then(function(response) {

  console.log(response);


})

};

// Local functions go below this line.
// ======================================================================================

// When the user hits the start button
function StartButton () {

  // Take their input and save it as a new Room ID
  var RoomID = $("#room-info").val();

  // Add the current user to the list of attendees is the local room, and remove them if they disconnect.
  var Attend = database.ref(RoomID+"/Attendees").push(true);
  Attend.onDisconnect().remove();

  // Add a listener that listens to the number of users in the room.
  database.ref(RoomID+"/Attendees").on("value", ChooseState(snap));

  database.ref(RoomID+"/RunState").on("value", DecideCourse(snap));

};

// When the number of users changes...
function ChooseState (UserSnap) {

  // Save a variable that is the number of users.
  var CurrentUsers = UserSnap.numChildren();

  if (CurrentUsers === 1) {

    database.ref(RoomID+"/RunState").set({"state" : "waiting"});

  } else if (CurrentUsers >= 2 && LocalState === "waiting") {

    database.ref(RoomID+"/RunState").set({"state" : "waiting"});

  }

};

// Local execution code goes below this line
//=======================================================================================

$(document).ready(function() {

  $("#start-btn").on("click", function() {

    StartButton();

  })
  




});

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

  var database = firebase.database();

  // Variables for the connection, part provided by Firebase, part stored in the DB.
var connectionsRef = database.ref("connections");
var connectedRef = database.ref(".info/connected");
var PersonalID = "";
var PersonalIDObj = "";


// When the client's connection state changes, push it to the local explicit connection monitor
connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        PersonalIDObj = connectionsRef.push(true);
        PersonalID = PersonalIDObj.path.pieces_[1];

        // Remove user from the connection list when they disconnect.
        PersonalIDObj.onDisconnect().remove();

    }
    
});




