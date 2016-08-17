//STEPH'S JS FILE FOR THE TRAIN ACTIVITY


// FIREBASE STUFF
//need to connect to firebase so that it stores data

	//copy and paste the key from "Add Firebase to your web app" 
	//in console.firebase.google.com
	var config = {
		apiKey: "AIzaSyA6eliE1cXZ1wqFeFzlKlyXZnWwTC0cFws",
		authDomain: "newone-8d248.firebaseapp.com",
		databaseURL: "https://newone-8d248.firebaseio.com",
		storageBucket: "newone-8d248.appspot.com",
	};

	//initialize firebase here
	//do this anytime you need firebase
	firebase.initializeApp(config);

	//variable for the firebase database makes it easier to manage calls
	var database = firebase.database();

// INTROPRESENCE FUNCTIONALITY
//will show how many people are waiting for a train
//aka how many people are looking at the page

	//this is the director of connections in firebase
	var connectionsRef = database.ref("/connections");

	// '.info/connected' is a special location provided by Firebase that is updated every time the client's connection state changes.
	// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
	var connectedRef = database.ref(".info/connected");

	// if someone comes on or off the page the "value" changes to or from "true"
	//causes them to be added or removed from connections
	connectedRef.on("value", function(snap) {

		// If they are connected..
		if( snap.val() ) {

			// Add user to the connections list.
			var con = connectionsRef.push(true);

			// Remove user from the connection list when they disconnect.
			con.onDisconnect().remove();
		};
	});

	// When first loaded or when the connections list changes...
	connectionsRef.on("value", function(snap) {

		//if statement bc GRAMMAR!
		//this will display the number of patient travelers in the jumbotron
		if (snap.numChildren()===1) {
			$("#patientTravelers").html("There is "+snap.numChildren()+" patient traveler waiting for the train.");
		}else {
			$("#patientTravelers").html("There are "+snap.numChildren()+" patient travelers waiting for the train.");
		}
	});


// SUBMIT BUTTON FUNCTIONALITY
//first users will fill in the add train form
//then they will click the "SUBMIT" button
//the info they submit should be added to firebase

	//when a user clicks the submit button...
	$("#submitButton").on("click", function(){

		//4 variables to store user input
		var storeName = $("#nameIn").val().trim();
		var storeDest = $("#destIn").val().trim();
		var storeFreq = $("#freqIn").val().trim();

		//tricky 4th variable stores time... 
		//come back to this one!
		var storeTime = $("#timeIn").val().trim();

		// object of user input
		var yourTrain = {
			trainName:  storeName,
			destination: storeDest,
			firstTrainTime: storeTime,
			frequency: storeFreq
		}

		// now push the object to firebase where it is stored as most recent child
		database.ref().push(yourTrain);

		// Alert to confirm new train addition.
		alert("Your train was added to the schedule!");

		// Clears all of the text-boxes for easy user input
		$("#nameIn").val("");
		$("#destIn").val("");
		$("#timeIn").val("");
		$("#freqIn").val("");

		return false;
	});


// USE DATABASE TO UPDATE THE CURRENT TRAIN SCHEDULE
//retrieve an object from firebase and put it into the table
//object flow: user input --> firebase --> train table

	//every time a child is added to the data base this function will be called
	//aka every time a user pushes submit bc the data goes to be added to firebase
	database.ref().on("child_added", function(childSnapshot, prevChildKey){

		// Store everything into variables
		var storeName = childSnapshot.val().trainName;
		var storeDest = childSnapshot.val().destination;
		var storeTime = childSnapshot.val().firstTrainTime;
		var storeFreq = childSnapshot.val().frequency;

		// for some reason this console logs every object already in the database
		console.log("4 checks to make sure database sends back info...")
		console.log("1. train name: "+storeName);
		console.log("2. dest: "+storeDest);
		console.log("3. first time: "+storeTime);
		console.log("4. freq: "+storeFreq);

		

		// Fix storeTime by subtracting a year to make sure the train is already coming
		var fixTime = moment(storeTime,"hh:mm").subtract(1, "years");
		console.log(fixTime);

		// tells what time it is RIGHT NOW
		var timeRightNow = moment();
		console.log("Right now it is " + moment(timeRightNow).format("hh:mm"));

		// finding the difference between now and the first train time in minutes
		var timeDifference = moment().diff(moment(fixTime), "minutes");
		console.log("It's been " + timeDifference +" minutes since the first train came.");

		// Modulo operation for remainder time between 
		// The most recent train was here modulo minutes ago
		var modulo = timeDifference % storeFreq;
		console.log(modulo);

		// Minute Until Train
		var timeUntilTrain = storeFreq - modulo;
		console.log("There are " + timeUntilTrain+ " minutes until the train comes.");

		// Next Train
		var nextTrainComes = moment().add(timeUntilTrain, "minutes")
		var prettyTrainTime = moment(nextTrainComes).format("hh:mm");
		console.log("The next train will come at " + prettyTrainTime);

		$("#trainTable > tbody").append("<tr><td>" + storeName + "</td><td>" + 
			storeDest + "</td><td>" + storeFreq + "</td><td>" + 
			prettyTrainTime + "</td><td>"+ timeUntilTrain + "</td></tr>");

	});