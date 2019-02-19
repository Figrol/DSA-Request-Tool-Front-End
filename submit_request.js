(function() {
    "use strict";

    //document.addEventListener('DOMContentLoaded', function() {
        //checkboxSystem1.disabled = true;
       // document.getElementById('radioCustomGroup').addEventListener('checked', removeDisabledChecked);
        document.getElementById('formRequest').addEventListener('submit', submitRequest);
        // document.getElementById('radioCustom').addEventListener('change', removeBlank);
        var radioButtons = document.forms["formRequest"].elements["system"];
        for(var i = 0, max = radioButtons.length; i < max; i++) {
            radioButtons[i].addEventListener('change', removeBlank);
        }


    var checkboxSystem1 = document.getElementById('checkboxSystem1'),
        checkboxSystem2 = document.getElementById('checkboxSystem2'),
        checkboxSystem3 = document.getElementById('checkboxSystem3'),
        checkboxSystem4 = document.getElementById('checkboxSystem4'),
        checkboxSystem5 = document.getElementById('checkboxSystem5');

        checkboxSystem1.disabled = true;
        checkboxSystem2.disabled = true;
        checkboxSystem3.disabled = true;
        checkboxSystem4.disabled = true;
        checkboxSystem5.disabled = true;
     //   });



function submitRequest(event) {
    event.preventDefault();
    console.log('it worked');



}

function removeBlank(event){
    event.preventDefault();

    if (document.getElementById('radioCustom').checked) {
        checkboxSystem1.disabled = false;
        checkboxSystem2.disabled = false;
        checkboxSystem3.disabled = false;
        checkboxSystem4.disabled = false;
        checkboxSystem5.disabled = false;
    } else  {
        checkboxSystem1.disabled = true;
        checkboxSystem2.disabled = true;
        checkboxSystem3.disabled = true;
        checkboxSystem4.disabled = true;
        checkboxSystem5.disabled = true;
    }
    console.log('it worked too!');

}


//function removeDisabledChecked()

})();