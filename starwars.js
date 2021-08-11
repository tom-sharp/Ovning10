console.log("---------- StarWars.js ------------");


// searchButton, searchText, resultText

const tBtn = document.querySelector("#plainTextButton");
const sBtn = document.querySelector("#searchButton");
// const sField = document.querySelector("#searchText");
const sForm = document.querySelector("#submitForm");

const uriSource = "https://www.swapi.tech/api/people/?name=";
// const uriSource = "http://127.1.1.1/api/people/?name=";


tBtn.addEventListener('click', () => { serverResponse(); });
sBtn.addEventListener('click', () => { findStarwarsFigure(); });
// sField.addEventListener('submit', () => { findStarwarsFigure(); });
sForm.addEventListener('submit', () => { findStarwarsFigure(); });


function findStarwarsFigure() {
	event.preventDefault();
	let sText = document.querySelector("#searchText");
	let rTxt = document.querySelector("#resultText");
	let sTxt = sText.value;

	sText.value = "";
	rTxt.value = "please wait...";
	console.log(sTxt);

	if (sTxt.length < 1) {
		showMessage("Can not search for an emty string");
		rTxt.value = "";
		return;
	}
	showMessage("Searching for " + sTxt);
	console.log(sTxt);
	sTxt = uriSource + sTxt;

	fetch(sTxt, {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	})
		.then(res => res.json())
		.then(data => {
			showMessage("Completed: " + data.message);
			console.log(data, typeof data.message);
			let props = null;
			if (data.result.length > 0) props = data.result[0];
			if (props === null) { rTxt.value = "not found"; return; }
			rTxt.value = `${props.description}\n`;
			rTxt.value += `Name:   ${props.properties.name}\n`;
			rTxt.value += `Gender: ${props.properties.gender}\n`;
			rTxt.value += `Height: ${props.properties.height}\n`;
			rTxt.value += `Mass:   ${props.properties.mass}\n`;
			rTxt.value += `Url:    ${props.properties.url}\n`;
		})
		.catch(err => { showMessage(err); rTxt.value = ""; });

}

function serverResponse() {
	let sText = document.querySelector("#searchText");
	let rTxt = document.querySelector("#resultText");
	let sTxt = sText.value;

	sText.value = "";
	rTxt.value = "please wait...";
	console.log(sTxt);

	if (sTxt.length < 1) {
		showMessage("Can not search for an emty string");
		rTxt.value = "";
		return;
	}
	showMessage("Searching for " + sTxt);
	console.log(sTxt);
	sTxt = uriSource + sTxt;

	fetch(sTxt, {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	})
		.then(res => res.text())
		.then(data => {
			showMessage("Completed");
			rTxt.value = data;
			console.log(data);
		})
		.catch(err => { showMessage(err); rTxt.value = ""; });

}
