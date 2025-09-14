let callButton = document.getElementById("call-button");

callButton.addEventListener("click", function(event) {
    event.preventDefault();
    var tollFreeNumber = document.querySelector("#phone-input").value;

    if (tollFreeNumber) {
        console.log("Calling " + tollFreeNumber);
    } else {
        console.log("Please enter a number");
    }
});