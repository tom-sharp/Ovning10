console.log("---------- misc.js ------------");


function showMessage(msg) {
	document.querySelector("#messageText").textContent = msg;
}

function showErrMessage(msg) {
	document.querySelector("#ErrorText").textContent = msg;
	document.querySelector("#SuccessText").textContent = "";
}
function showSuccessMessage(msg) {
	document.querySelector("#ErrorText").textContent = "";
	document.querySelector("#SuccessText").textContent = msg;
}

function showDealerMessage(msg) {
	document.querySelector("#DealerMessage").textContent = msg;
}

function showYouMessage(msg) {
	document.querySelector("#YouMessage").textContent = msg;
}
