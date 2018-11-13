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
var RoomID = "";
var RestaurantArray = [];
var ChoiceCounter = 0;

// Local functions go below this line.
// ======================================================================================
// HTTPS or HTTP?
function ipLookUpZomatoReturn () {
  $.ajax('https://cors-ut-bootcamp.herokuapp.com/http://ip-api.com/json')
  .then(
      function success(response) {
          console.log('User\'s lat is: ', response.lat);
          console.log('User\'s long is: ', response.lon);
          var userLat = response.lat;
          var userLon = response.lon;
          // Run zomato function with lat and long. 
          zomatoLookup(userLat,userLon);
      },

      function fail(data, status) {
          console.log('Request failed.  Returned status of', status);
      }  
  );
}

function zomatoLookup(lat,lon) {
  var rapid = new RapidAPI("default-application_5bd9ddc8e4b0d1763ed6b07c", "0b60f110-a5a7-4fe2-93af-42199127603c");
  rapid.call('Zomato', 'getLocationDetailsByCoordinates', { 
    'coordinates': `${lat}, ${lon}`,
    'apiKey': 'c30eca16c0c03ef51799b26e942490e3'
  
  }).on('success', function (payload) {
     
     // store paylod in firebase
     fireBaseTheseResturants(payload.result.nearby_restaurants);

    }).on('error', function (payload) {

     console.log(payload);
     console.log("ERROR on zomatoLookup function");
  });
}

function fireBaseTheseResturants(payload) {
  
  console.log("fireBaseTheseResturants has been run");
  
  database.ref(RoomID + "/Restaurants").set(payload);
  RestaurantArray = payload;
};

// When the user hits the start button
function StartButton () {
	
  // Take their input and save it as a new Room ID
  RoomID = $("#roomKey").val();
	
  // If they've entered a Room key, put them in that room
	if (RoomID !== "") {
  
  	// Add the current user to the list of attendees is the local room, and remove them if they disconnect.
  	var Attend = database.ref(RoomID+"/Attendees").push(true);
  	Attend.onDisconnect().remove();

  	// Look at the number of people in the room and decide what to do. Might be able to just put in ChooseState(snap), but not certain.
  	database.ref(RoomID+"/Attendees").once("value").then(function(snap) {
    
    	ChooseState(snap) 
  
  	});

  	// Add a listener for the state of the interaction.
  	database.ref(RoomID+"/RunState").on("value", function(snap) {DecideCourse(snap)}, function(){

    	database.ref(RoomID+"/RunState").set ({"state" : LocalState});

  	});
  
  // If they haven't entered a roomkey, tell them they need to.
  } else {
  
  	$("#roomKey").attr("placeholder", "You MUST enter a Room Key.");
  
  }

};

// When a user enters, the number of users in the room is checked and...
function ChooseState (UserSnap) {

  // Save a variable that is the number of users.
  var CurrentUsers = UserSnap.numChildren();

  // If the current user is the first...
  if (CurrentUsers === 1) {

    // the current user is labeled "PlayerOne"
    if (LocalID === "") {LocalID = "PlayerOne";}

    // The first person should get the list of restaurants and push it to the appropriate place on FireBase
    ipLookUpZomatoReturn ();

    // and the state on FireBase is set to "waiting" (for the second person)
    database.ref(RoomID+"/RunState").set({"state" : "waiting"});

  // If the user entering is the second user, 
  } else if (CurrentUsers >= 2 && LocalState === "waiting") {

    // the user entering is set to "PlayerTwo"
    if (LocalID === "") {LocalID = "PlayerTwo";}

    // The second person should retrieve the list of restaurants from FireBase and save it locally
    database.ref(RoomID + "/Restaurants").once("value", function(snap){
    
   	// Take the snapshot of the value of that location, and save it as the local variable RestaurantArray
    RestaurantArray = snap.val();

    // and the state on FireBase is set to "choosing."
    database.ref(RoomID+"/RunState").set({"state" : "choosing"});
    
    });

    
  }

};

// This function sets up the screen (creates the divs and buttons) for the choosing phase.
function PrepareDecisions () {
  
  // Clear HTML.
  $(".container").empty();

  // Add different divs for each item
  // #image-div
  $(".container").append("<div id=\"image-div\"><img id=\"rest-img\"></div>");
  $("#rest-img").attr("onerror", "../assets/images/favicon.gif");
  // #name-div
  $(".container").append("<div id=\"name-div\"></div>");
  // #rating-div
  $(".container").append("<div id=\"rating-div\"></div>");
  // #cusine-div
  $(".container").append("<div id=\"cuisine-div\"></div>");
  // #thumbs-up
  $(".container").append("<div id=\"thumbs-up\"><img src=\"assets/images/thumbsUp.png\" id=\"thumbs-up-img\" class=\"thumb-img\"></div>");
  $("#thumbs-up").addClass("thumbs");
  $("#thumbs-up").attr("value", "true");
  // #thumbs-down
  $(".container").append("<div id=\"thumbs-down\"><img src=\"assets/images/thumbsDown.png\" id=\"thumbs-down-img\" class=\"thumb-img\"></div>");
  $("#thumbs-down").addClass("thumbs");
  $("#thumbs-down").attr("value", "false");
  $(".thumbs").on("click", ThumbButton);
  
};


// Make function for waiting room
function waitingScreen() {

	$(".container").empty();
  
  //Display waitingscreen
  $(".container").append("<div class=\"lds-hourglass\"></div>");
  var WaitMessage = $("<h4>");
  WaitMessage.text("Waiting for others. Please give them your Room Key: " + RoomID);
  $(".container").append(WaitMessage);

  
}


// Depending on the stored state
function DecideCourse (StateSnap) {

  LocalState = StateSnap.val().state;

  // If you're waiting, Inform the user that they're waiting.
  if (LocalState === "waiting") {
  
  	waitingScreen();
  
  }

  // If you're choosing for the first time, prepare the screen and present a new option
  else if (LocalState === "choosing") {

    PrepareDecisions();
    NewOption();

  // if you're choosing for a subsequent time, just present a new option
  } else if (LocalState === "rechoosing") {

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

  // Set the default selection to 'yes'
  LocalChoice = true;

  // Clear out the choices from the last restaurant.
  database.ref(RoomID+"/UserChoices/").set(null);

  // Extract the current values and save them as a local variable
  var CurrentImg = RestaurantArray[ChoiceCounter].restaurant.featured_image;
  if (CurrentImg = "") {CurrentImg = "../assets/images/favicon.gif";}
  var CurrentName = RestaurantArray[ChoiceCounter].restaurant.name;
  var CurrentCuisine = RestaurantArray[ChoiceCounter].restaurant.cuisines;
  var CurrentRating = RestaurantArray[ChoiceCounter].restaurant.user_rating.aggregate_rating;

  // Apply those values to the display.
  $("#rest-img").attr("src", CurrentImg);
  $("#name-div").text(CurrentName);
  $("#cuisine-div").text("Kind of food: " + CurrentCuisine);
  $("#rating-div").text("Rating: " + CurrentRating);

  // TODO Give directions and define a timer span. (should happen in PrepareDecisions)

  var TimeRemaining = 30;
  
  // Set a timer - commented out for now to facilitate testing.
  // CurrentTimer = setInterval(function () {

  //     TimeRemaining--;
  //     TimerSpan.textContent = TimeRemaining;

  //     // if time expires, pick a random choice.
  //     if (TimeRemaining <= 0) {

  //         clearInterval(CurrentTimer);
          
  //         TransmitChoice(LocalChoice);

  //       }

  // }, 1000);

  ChoiceCounter++;
};

// When thumbs up or down is pressed
function ThumbButton () {

  // Clear the interval running
  // clearInterval(CurrentTimer);

  // Set the LocalChoice to the button
  if ($(this).attr("value") === "false") {

    LocalChoice = false;

  };


  // And send that to FireBase
  TransmitChoice (LocalChoice);

}

// Sends the choice the player has made to the database.
function TransmitChoice (Choice) {

  // Push the choice to FireBase
  // Need a conditional because apparently the first part of a set statement can't be a variable.
  if(LocalID === "PlayerOne") {

      database.ref(RoomID + "/UserChoices").update({PlayerOne : Choice});
  
  } else if (LocalID === "PlayerTwo") {

      database.ref(RoomID + "/UserChoices").update({PlayerTwo : Choice});

  }

  // Check to see if it's the first or second decision and set the state accordingly

  database.ref(RoomID + "/UserChoices").once("value").then(function (snap){

    // if it's the first decision    
    if (snap.numChildren() === 1) {

      // change the state to "choosewait"
      database.ref(RoomID+"/RunState").set({"state" : "choosewait"});

    // if it's the second decision, set state to "chosen"
    } else if (snap.numChildren() === 2) {

      database.ref(RoomID+"/RunState").set({"state" : "chosen"});

    }

  })

};

// This evaluates the two choices
function Evaluate () {

  // Use player one as the 'server' for deciding what the outcome of the choice was to avoid doubled setting of state on FireBase.
  if (LocalID === "PlayerOne") {

    // Get the decisions from FireBase
    database.ref(RoomID + "/UserChoices").once("value").then(function (snap) {

      // If both choices were true (thumbs up - TODO this may change depending on how the data ends up being stored on FireBase)
      if (snap.val().PlayerOne && snap.val().PlayerTwo) {

        // Set the state on FireBase to decided - ending the loop
        database.ref(RoomID+"/RunState").set({"state" : "decided"});

      // otherwise...
      } else {

        // Set the state on FireBase to rechoosing, which brings up a new option.
        database.ref(RoomID+"/RunState").set({"state" : "rechoosing"});

      }
    
    });

  }

};

// This function displays the choice you've both agreed on.
function DisplayResult () {

  // Remove the listener to the state before state gets deleted.
  database.ref(RoomID+"/RunState").off();

  // Clear the content and add celebration and information.
  $(".container").empty();
  $(".container").append("<div id=\"image-div\"><img id=\"result-img\" src=\"https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif\"></div>");
  $(".container").append("<h3>YOU FORKED OFF!</h3>");

  var NameDiv = $("<div>")
  NameDiv.text(RestaurantArray[ChoiceCounter-1].restaurant.name)  
  $(".container").append(NameDiv);
  
  var AddressDiv = $("<div>");
  AddressDiv.text(RestaurantArray[ChoiceCounter-1].restaurant.location.address);
  $(".container").append(AddressDiv);
  
  // Clean the room from the FireBase (using PlayerTwo as the 'server')
  if (LocalID === "PlayerTwo") {

      setTimeout ( function () {database.ref(RoomID).remove()}, 1000);

  }

};

// Local execution code goes below this line
//=======================================================================================

$(document).ready(function() {

  $("#start-btn").on("click", function(event) {

    // Since the button is a submit button, stop it from doing anything.
    event.preventDefault();
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