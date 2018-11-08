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
//

var GoogleAPIkey = "AIzaSyA7b0Y8wH7Awthb9-CDlqAPtrr-Q2JCTVw";
var ZomatoAPIkey = "c30eca16c0c03ef51799b26e942490e3";

var ZomatoQuery = "https://cors-ut-bootcamp.herokuapp.com/https://developers.zomato.com/api/v2.1/search?";
// var ZomatoQuery = "https://developers.zomato.com/api/v2.1/search?q=franklins"

$.ajax({
  url: ZomatoQuery,
  headers: {'user_key' : ZomatoAPIkey},
  params: {q: 'franklins'}, 
  method: "GET"}).then(function(response) {

    console.log("I'm trying!");
    console.log(response);

})