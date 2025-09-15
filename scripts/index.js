let callButton = document.getElementById("call-button");
let phoneInput = document.getElementById("phone-input");
let phoneInputValue = phoneInput.placeholder;

callButton.addEventListener("click", function(event) {
    event.preventDefault();
    var tollFreeNumber = phoneInput.value;

    if (tollFreeNumber == 1280) {
        window.location.href = "voice.html";
    } else {
        let prevColor = callButton.style.backgroundColor;
        phoneInput.value = "";
        phoneInput.placeholder = "Invalid Number !";
        callButton.style.backgroundColor = "red";

        setTimeout(() => {
            callButton.style.backgroundColor = prevColor;
            phoneInput.value = "";
            phoneInput.placeholder = phoneInputValue;
        }, 2000);
    }
});