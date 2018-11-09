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

var LocalState = "waiting"
var LocalID = "";

var GoogleAPIkey = "AIzaSyA7b0Y8wH7Awthb9-CDlqAPtrr-Q2JCTVw";
var ZomatoAPIkey = "c30eca16c0c03ef51799b26e942490e3";

var ZomatoQuery = "https://cors-ut-bootcamp.herokuapp.com/https://developers.zomato.com/api/v2.1/search?";


// Local functions go below this line.
// ======================================================================================

function ipLookUp () {
  $.ajax('http://ip-api.com/json')
  .then(
      function success(response) {
          console.log('response: ', response);
          console.log('User\'s lat is: ', response.lat);
          console.log('User\'s long is: ', response.lon);
          var userLat = response.lat;
          var userLon = response.lon;
          zomatoLookup(userLat,userLon);
      },

      function fail(data, status) {
          console.log('Request failed.  Returned status of', status);
      }  
  );
}

function zomatoLookup(lat,lon) {
  console.log(lat, lon);
  rapid.call('Zomato', 'getLocationDetailsByCoordinates', { 
    'coordinates': `${lat}, ${lon}`,
    'apiKey': 'c30eca16c0c03ef51799b26e942490e3'
  
  }).on('success', function (payload) {
     /*YOUR CODE GOES HERE*/ 
     console.log(payload);
  }).on('error', function (payload) {
     /*YOUR CODE GOES HERE*/ 
  });
}
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

    if (LocalID === "") {LocalID = "PlayerOne";}

    database.ref(RoomID+"/RunState").set({"state" : "waiting"});

  } else if (CurrentUsers >= 2 && LocalState === "waiting") {

    if (LocalID === "") {LocalID = "PlayerTwo";}

    PrepareDecisions();

    database.ref(RoomID+"/RunState").set({"state" : "choosing"});

  }

};

// This function sets up the screen (creates the divs and buttons) for the choosing phase.
function PrepareDecisions () {};

// Depending on the stored state
function DecideCourse (StateSnap) {

  LocalState = StateSnap.val().state;

  // If you're waiting, don't do anything
  if (LocalState === "waiting") {}

  // If you're choosing, present a new option
  else if (LocalState === "choosing") {

    NewOption();

  }

  // If one person has chosen, you're still waiting.
  else if (LocalState === "choosewait") {

    // possibly a function that says you're waiting for the other person

  }

  // If both people have chosen, check their agreement
  else if (LocalState === "chosen") {

    Evaluate();

  }

  // If you've agreed, display results
  else if (LocalState === "decided") {

    DisplayResult();

  };

};

// This puts a new option on the screen, corresponding to some kind of index.
function NewOption () {

  LocalChoice = true;
  database.ref(RoomID+"/Choices/").set({});

  // TODO Give directions and define a timer span.

  var TimeRemaining = 30;

  CurrentTimer = setInterval(function () {

      TimeRemaining--;
      TimerSpan.textContent = TimeRemaining;

      // if time expires, pick a random choice.
      if (TimeRemaining <= 0) {

          clearInterval(CurrentTimer);
          
          TransmitChoice(LocalChoice);

        }

  }, 1000);


};

// Sends the choice the player has made to the database.
function TransmitChoice (Choice) {

  // Need a conditional because apparently the first part of a set statement can't be a variable.
  if(LocalID === "PlayerOne") {

      database.ref("RPS/Choices/").update({PlayerOne : Choice});
  
  } else {

      database.ref("RPS/Choices/").update({PlayerTwo : Choice});

  }
  
};

// This evaluates the two choices
function Evaluate () {};

// This function displays the choice you've both agreed on.
function DisplayResult () {};

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