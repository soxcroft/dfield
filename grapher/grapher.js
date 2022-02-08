
// This module just contains methods for getting from and setting to html
// document, so that it doesn't contain so much inline javascript

//TODO canvas already global
var elem = document.getElementById("myCanvas");
// event listener for 'click' events
elem.addEventListener('click', function(event) {

	algsDict = {
		"eulersMethod": eulersMethod,
		"modifiedEulersMethod": modifiedEulersMethod,
		"rungeKuttaMethod": rungeKuttaMethod,
		"adamsBashforthMoultonMethod": adamsBashforthMoultonMethod
	};

	// get points
	let cx = event.pageX - elem.offsetLeft - elem.clientLeft;
	let cy = event.pageY - elem.offsetTop - elem.clientTop;

	// get differential equations and stepsize
	let yPrime = strToFunc(
		document.getElementById("inp_y_prime").value);
	let xPrime = strToFunc(
		document.getElementById("inp_x_prime").value);
	let stepsize =
		Number(document.getElementById("inp-stepsize").value);

	// get algorithm and plot solution to equations with given
	// initial conditions
	let f =
		algsDict[document.getElementById("select-algorithm").value];

	let	points =
		f((cx-xoffset)/xscale,(-cy+yoffset)/yscale,xPrime,yPrime,stepsize);
	plotPoints(points);
	points =
		f((cx-xoffset)/xscale,(-cy+yoffset)/yscale,xPrime,yPrime,-stepsize);
	plotPoints(points)
	}, false);

function getFunctions() {
	// returns struct containing functions
	return {
		"yPrime": strToFunc(
			document.getElementById("inp_y_prime").value),
		"xPrime": strToFunc(
			document.getElementById("inp_x_prime").value)
	}
}

function checkFunction(funcStr, errorId) {
	// Check that the function is valid
	let errorMsg = parse(funcStr);
	if (errorMsg == "") {
		document.getElementById(errorId).innerHTML = "";
		document.getElementById("btn_dfield").disabled = false;
		document.getElementById("btn_pplane").disabled = false;
	} else {
		document.getElementById(errorId).innerHTML = errorMsg;
		document.getElementById("btn_dfield").disabled = true;
		document.getElementById("btn_pplane").disabled = true;
	}
}

function updateForm() {
	// Hides or shows x' and draw dfield/pplane buttons
	if (document.getElementById("display_dfield").checked) {
		document.getElementById("tr_x_prime").style="display:none";
		document.getElementById("btn_dfield").style="display:inline";
		document.getElementById("btn_pplane").style="display:none";
		document.getElementById("inp_x_prime").value = "1";
	} else {
		document.getElementById("tr_x_prime").style="display:table-row";
		document.getElementById("btn_pplane").style="display:inline";
		document.getElementById("btn_dfield").style="display:none";
	}
}

