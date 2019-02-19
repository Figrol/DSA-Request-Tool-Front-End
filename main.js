//Declare constant variables, these are the URL's that may need to be used for all functions to make API calls
const url = "https://10.10.1.25/api/v2/";
const authURL = "authtoken/";
const hostsURL = "hosts/";
const jobsURL = "jobs/";
const jobTemplatesURL = "job_templates/";
const launchURL = "launch/";
const inventoryURL = "inventories/";

function login(event) {
    // Prevent default action
    event.preventDefault();

    //Get form data and output text data and store as a variable
    var loginForm = document.getElementById('formLogin');
    var output = document.getElementById('txtOutput');
    //Setting username and password to variables
    var textUsername = loginForm.username.value;
    var textPassword = loginForm.password.value;

    //** POST to get Auth Token **

    //Initiate XMLHttpRequest and declare variables to store auth token
    var xhr = new XMLHttpRequest();
    var authToken;
    var authTokenExpiry;

    //Open connection and specify HTTP request. Asynchronous request is defaulted.
    xhr.open('POST', url + authURL);
    //set expected response type
    xhr.responseType = 'json';
    //Declare data variable to store data to be sent
    var data = {};
    //Declare username and password and their variable names in the API
    data["username"] = textUsername;
    data["password"] = textPassword;
    //Set content type to JSON so that JSON data is expected
    xhr.setRequestHeader('Content-type', 'application/json');
    //turn data into JSON string
    var json = JSON.stringify(data);
    //make call to API
    xhr.send(json);
    //Once API call has been completed
    xhr.onload = function() {
        //If statement to check if status code is 200 (success)
        if (xhr.status === 200) {
            //Gets the auth token from the request.
            authToken = xhr.response.token;
            //Gets the auth token expiry date
            authTokenExpiry = xhr.response.expires;
            //Splits the dates to remove 10th of seconds off at the '.'. Split into a 2 part array
            authTokenExpiry = authTokenExpiry.split('.');
            //Takes the first part in the split array which is the date and time
            authTokenExpiry = authTokenExpiry[0];
            //New date invoked and expiry inserted into it
            var tokenDate = new Date(authTokenExpiry);
            //Date is transferred into a UTC string as a cookie will only take this format
            tokenDate = tokenDate.toUTCString();
            //Cookie is formed so as other pages can use the data
            document.cookie = 'authTok=' + authToken + "; expires=" + tokenDate;
            //Redirect to home page
            window.location.href = "home.html";
        //Else if for incorrect login details
        } else if (xhr.status === 400) {
            output.innerHTML = "Incorrect Login details. Please try again.";
            //Else for all other errors
        } else {
            output.innerHTML = "There has been an unexpected error. Please contact your system administrator and " +
                "quote the error code: " + xhr.status + " " + xhr.statusText;
        }

    }

}
//Function to get the inventories that are available to create a dropdown list to allow users to
//be able to select different ones.
 function getInventories(inventoriesDropdown, URLdecider) {
     //event.preventDefault();
     //check that the user is logged in before allowing access
    checkLoggedIn();

    //Declare variables
    var xhr = new XMLHttpRequest();
    var cookie = getCookie();
    var inventory;

    //If statement to chose different API connection depending on what type of system is being managed
    if (URLdecider === 'windows') {
        //Will bring down all Windows inventories
        xhr.open('GET', url + inventoryURL + '?description=' + URLdecider);
    } else if (URLdecider === 'linux') {
        //Will bring down all linux inventories
        xhr.open('GET', url + inventoryURL + '?description=' + URLdecider);
    } else {
        //Will bring down all inventories
        xhr.open('GET', url + inventoryURL);
    }
    //set expected response type
    xhr.responseType = 'json';
    //set the request headers with content types and authorization type and auth token
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Token ' + cookie);
    //make call to API
    xhr.send();
    //Function to be run once API call has been completed
    xhr.onload = function (){
        //reads the array of values that is returned back in to a variable
        inventory = xhr.response.results;
        //for loop to read in inventories
        inventoriesDropdown.innerHTML = '<option value=""> </option>'
        for (var i = 0; i < inventory.length; i++){
            //will read each inventory into an option for a select tag which creates a dropdown
            //list of the inventory options.
            inventoriesDropdown.innerHTML = inventoriesDropdown.innerHTML + '<option value="' + inventory[i].id + '">'
                + inventory[i].name + '</option>'

        }
    }
}

//Function will get list of hosts within in inventory
function getHost(host) {
    //Check that the user is logged in
    checkLoggedIn();

    //Declare variables
    var xhr = new XMLHttpRequest();
    var cookie = getCookie();
    var inventorySelected = document.getElementById('selectInventoryToEdit').value;

    //If statement to pevent error if no inventory is selected
    if (inventorySelected === ''){

    } else {
        //Open the
        xhr.open('GET', url + inventoryURL + inventorySelected + '/hosts/');

        xhr.responseType = 'json';
        //set the request headers with content types and authorization type and auth token
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Token ' + cookie);
        //make call to API
        xhr.send();
        //Function to be run once API call has been completed
        xhr.onload = function () {
            host.innerHTML = '<p></p>'
            //reads the array of values that is returned back in to a variable
            inventory = xhr.response.results;
            //for loop to read in hosts from output
            for (var i = 0; i < inventory.length; i++) {
                //will read each host into text with the hostname and whether the system is enabled or not.
                //It will then create a button to toggle the enabled status of the host
                if (inventory[i].enabled === true) {
                    host.innerHTML = host.innerHTML + 'Hostname: ' + inventory[i].name
                        + '<br> System Enabled? <font color="green"> System is enabled </font> <button id="' + inventory[i].id + '" onclick="setEnabled('
                        + inventory[i].id + ')">' + 'Toggle Enabled </button><br><br>'
                } else {
                    host.innerHTML = host.innerHTML + 'Hostname: ' + inventory[i].name
                        + '<br> System Enabled? <font color="red"> System is disabled </font> <button id="' + inventory[i].id + '" onclick="setEnabled('
                        + inventory[i].id + ')">' + 'Toggle Enabled </button><br><br>'

                }

            }
        }
    }
}

function setEnabled(hostID) {
    //Check that the user is logged in
    checkLoggedIn();

    //Declare variables, two XMLHttpRequests are declared here as we need to run 2 API calls in the same function,
    //meaning that if we use the same variable name we end up with a loop when the request is sent a second time
    var xhr = new XMLHttpRequest();
    var chr = new XMLHttpRequest();
    var cookie = getCookie();
    var data = {};

    //API request opened
    xhr.open('GET', url + hostsURL + hostID + '/');
    //response type set
    xhr.responseType = 'json';
    //set the request headers with content types and authorization type and auth token
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Token ' + cookie);
    //make call to API
    xhr.send();
    //function to ocurr when data is sent back from the host
    xhr.onload = function () {
        //response is passed into a variable
        inventory = xhr.response;
        //second API call is opened
        chr.open ('PATCH', url + hostsURL + hostID + '/');
        //response type set
        chr.responseType = 'json';
        //request headers set
        chr.setRequestHeader('Content-Type', 'application/json');
        chr.setRequestHeader('Authorization', 'Token ' + cookie);
        //If statement to determine what to set the enabled value to. If it is currently "true" it will set it to "false"
        if (inventory.enabled === true) {
            data["enabled"] = false;
        //If statement to determine what to set the enabled value to. If it is currently "false" it will set it to "true"
        } else if (inventory.enabled === false) {
            data["enabled"] = true;
            //Else, nothing else will happen.
        } else {
            console.log("didn't work");
        }
        //Data variable is turned into a JSON object
        var json = JSON.stringify(data);
        //API request is made.
        chr.send(json);
    }
}
//Function to read possible jobs into select statement that are available for a certain type of OS.
function getTemplates(inventoryChoice) {
    //Check that the user is logged in
    checkLoggedIn();
    //Declare Variables
    var xhr = new XMLHttpRequest();
    var cookie = getCookie();
    var inventorySelected = document.getElementById('selectInventoryToAutomate').value;

    //Open API connection
    xhr.open('GET', url + jobTemplatesURL + '?inventory=' + inventorySelected);
    //set response type
    xhr.responseType = 'json';
    //set the request headers with content types and authorization type and auth token
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Token ' + cookie);
    //make call to API
    xhr.send();
    //Function to be run once API call has been completed
    xhr.onload = function (){
        inventoryChoice.innerHTML = '<option value=""> </option>'
        //reads the array of values that is returned back in to a variable
        inventory = xhr.response.results;
        //for loop to read in inventories
        for (var i = 0; i < inventory.length; i++){
            //will read each inventory into an option for a select tag which creates a dropdown list of
            //the inventory options.
            inventoryChoice.innerHTML = inventoryChoice.innerHTML + '<option value="' + inventory[i].id + '">'
                + inventory[i].name + '</option>'

        }
    }
}

function addHost(event) {
    //prevent the default event form occurring
    event.preventDefault();
    //Check that the user is logged in
    checkLoggedIn();
    //loads in form data
    var addHostForm = document.getElementById('formAddNewHost');
    var hostOutput = document.getElementById('hostResult1');
    var hostOutput2 = document.getElementById('hostResult2');
    var inventoriesDropdown = document.getElementById('selectInventory');

    // Declare page variables for data from form
    var textHostname = addHostForm.hostname.value;
    var textDescription = addHostForm.description.value;
    var checkboxEnabled = $('input[name=enabled]:checked').val();
    var inventorySelected = inventoriesDropdown.value;
    var textInstanceID = addHostForm.instance.value;
    var textVariables = addHostForm.variables.value;
    var responseAll;
    var response1;
    var response2;


    //Initiate Method used for HTTP requests
    var xhr = new XMLHttpRequest();
    //Enter data used to open the connection
    xhr.open('POST', url + hostsURL);
    //specifies the type of connection to be made
    xhr.responseType = 'json';
    //invokes the data variable to store data to be sent
    var data = {};
    //data is pulled from the form and given an identifier
    data["name"] = textHostname;
    data["description"] = textDescription;
    data["inventory"] = inventorySelected;
    data["enabled"] = checkboxEnabled;
    data["instance_id"] = textInstanceID;
    data["variables"] = textVariables;
    //Cookie is stored locally
    var cookie = getCookie();
    //Content type expected is set to JSON
    xhr.setRequestHeader('Content-Type', 'application/json');
    //Auth Token is included into the request header
    xhr.setRequestHeader('Authorization', 'Token ' + cookie);
    //Data is converted into JSON string
    var json = JSON.stringify(data);
    //API call is made
    xhr.send(json);
    //If statement to catch if successful
    xhr.onload = function () {
        //checks if status = 201 which is data successfully added
        if (xhr.status === 201) {
            //prints out confirmation
            hostOutput.innerHTML = "Congratulations, the host " + textHostname + " has been successfully " +
                "added to the system."
            hostOutput2.innerHTML = "";
            //Error logging
        } else {
            //Get the error response
            responseAll = xhr.response;
            //Turn error response into string
            responseAll = JSON.stringify(responseAll);
            //Split error into sections by " The Error comes in the form {"Error type":["Error message"]}
            responseAll = responseAll.split('"');
            //The message is split and we only want the 2nd and 4th array element which are the error types and message respectivley
            response1 = responseAll[1];
            response2 = responseAll[3];
            //I use an if statement to simply not show if an error contains "__all__" as it may not mean anything to the user.
            if (response1 === "__all__") {
                hostOutput.innerHTML = "There has been an unexpected error: (" + response2 + ")";
                hostOutput2.innerHTML = "Please contact your system administrator and quote the error code: "
                    + xhr.status + " " + xhr.statusText;
            } else {
                hostOutput.innerHTML = "There has been an unexpected error: (" + response1 + ") (" + response2 + ")";
                hostOutput2.innerHTML = "Please contact your system administrator and quote the error code: "
                    + xhr.status + " " + xhr.statusText;
            }
        }
    }
}
//Function take the cookie and split the value form the name of the cookie
function getCookie() {
    var bigCookie = document.cookie;
    //Cookie identifier is split from cookie into an array
    bigCookie = bigCookie.split('=');
    //identifier is disregarded
    bigCookie = bigCookie[1];
    //the cookie is returned as an answer
    return bigCookie;
}
//Function to run a chosen job.
function runJob(event) {
    //Check that the user is logged in
    checkLoggedIn();
    //Declare variables
    var template = event.value + '/';
    var xhr = new XMLHttpRequest();
    var data = "{}";
    var resultOutput = document.getElementById('resultOut');
    var cookie = getCookie();

    //POST request to launch job the 7 ensures that this only runs on inventory no.7 which is all linux machines
    xhr.open('POST', url + jobTemplatesURL + template + launchURL);
    //Set response type expected
    xhr.responseType = 'json';
    //set the request headers with content types and authorization type and auth token
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Token ' + cookie);
    //make request
    xhr.send(data);
    //Function to run as data loads back
    xhr.onload = function () {
        //if Statement runs if a 201 status is reported. A 201 means the post was successfully completed
        if (xhr.status === 201) {
            resultOutput.innerHTML = "The job has been scheduled correctly!";
            //The respose id is receieved which is the job number. We will need this to lookup the result of the job later
            sessionStorage.lastjob = xhr.response.id;
            } else {
            resultOutput.innerHTML = "Ooops! Something went wrong!";
            //Get the error response
            var responseAll = xhr.response;
            //Turn error response into string
            responseAll = JSON.stringify(responseAll);
            //Split error into sections by " The Error comes in the form {"Error type":["Error message"]}
            responseAll = responseAll.split('"');
            //The message is split and we only want the 2nd and 4th array element which are the error types and message respectivley
            var response1 = responseAll[1];
            var response2 = responseAll[3];
            //I use an if statement to simply not show if an error contains "__all__" or the word "detail" as it may not mean anything to the user.
            if (response1 === "__all__") {
                resultOutput.innerHTML = "There has been an unexpected error: (" + response2 + ") " +
                    "Please contact your system administrator and quote the error code: " + xhr.status + " "
                    + xhr.statusText;
            } else if (response1 === "detail"){
                resultOutput.innerHTML = "There has been an unexpected error: (" + response2 + ") " +
                    "Please contact your system administrator and quote the error code: " + xhr.status + " "
                    + xhr.statusText;
            } else {
                resultOutput.innerHTML = "There has been an unexpected error: (" + response1 + ") (" + response2 + ") " +
                    "Please contact your system administrator and quote the error code: " + xhr.status + " "
                    + xhr.statusText;
            }
        }
    }
}
//Function to get the status of a job
function jobStatus(event) {
    //Prevent default event action
    event.preventDefault();

    checkLoggedIn();
    //initiate the XMLHttpRequest method to make an API call
    var res = new XMLHttpRequest;
    //set the output variable as the session variable which was the last job number
    var output = sessionStorage.lastjob;
    //Initiate the result output element
    var resultOutput = document.getElementById('resultOut');
    //get the token cookie for the request
    var cookie = getCookie();

    var finished;

    //Open the connection
    res.open('GET', url + jobsURL + output + "/");
    //Set the expected response type to json
    res.responseType = 'json';
    //set the request headers. The content type and authorization token
    res.setRequestHeader('Content-Type', 'application/json');
    res.setRequestHeader('Authorization', 'Token ' + cookie);
    //make the request
    res.send();
    //Function to run once call has been made
    res.onload = function () {
        //get the response status from the reply
        var resultStatus = res.response.status;
        var finished = res.response.finished;
        //This will check if the job is still pending. If it is, this means that the job has not started to run yet
        //meaning that there is no output.
        if (finished === "null") {
            resultOutput.innerText = "This job is still running, please click the Result Output button to see the output" +
                " of the job. " +
                "Alternatively, check back here to see the status of the job later!"
            //The result will be output.
        } else {
            resultOutput.innerText = "The status of this job is '" + resultStatus + "'. Please " +
                "see the output log for further information."
        }

    };

}

//This will update the result box at the bottom of the generic linux command page.
function jobResult(event) {
    event.preventDefault();
    //Check that the user is logged in
    checkLoggedIn();
    //initiate the XMLHttpRequest method to make an API call
    var res = new XMLHttpRequest;
    //set the output variable as the session variable which was the last job number
    var output = sessionStorage.lastjob;
    //Initiate the result output element
    var resultOutput = document.getElementById('resultOut');
    //get the token cookie for the request
    var cookie = getCookie();

    //Open the connection
    res.open('GET', url + jobsURL + output + "/");
    //Set the expected response type to json
    res.responseType = 'json';
    //set the request headers. The content type and authorization token
    res.setRequestHeader('Content-Type', 'application/json');
    res.setRequestHeader('Authorization', 'Token ' + cookie);
    //make the request
    res.send();
    //Function to run once call has been made
    res.onload = function () {
        //get the response status from the reply
        var resultStatus = res.response.status;
        //This will check if the job is still pending. If it is, this means that the job has not started to run yet
        //meaning that there is no output.
        if (resultStatus === "pending") {
            resultOutput.innerText = "This job has not finished running yet. Please wait."
            //The result will be output.
        } else {
                resultOutput.innerText = res.response.result_stdout;
        }

    };

}

//Function to log the user out when logout is clicked
function logout(event) {
    event.preventDefault();
    //reset cookie to remove Auth Token to prevent redirecting back to a page and
    document.cookie = "authTok=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    //redirect to the login page
    window.location.href = "index.html";
}
//Function to check if the user is logged in, preventing them from using the system if they are not
function checkLoggedIn() {
    //Checks if the user is logged in by seeing whether the cookie is empty. If it is then they will receieve an alert
    //and be redirected to the login screen.
    if (document.cookie === ""){
        alert("You are not logged in, you will be re-directed. Please login.");
        window.location.href = "index.html";
        //If the cookie exists, the user will not be impeaded in any way.
        exit();
    } else {

    }
}
