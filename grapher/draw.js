
// Drawing methods for eg axes and functions

var canvas;
var context;
//var width = canvas.width, height = canvas.height;
var minx, maxx, miny, maxy;

function initCanvas() {

	console.log(document);

	canvas = document.getElementById("myCanvas");
	context = canvas.getContext('2d');

	// set global variables and draws the axes
	minx = document.getElementById("minx").value;
	maxx = document.getElementById("maxx").value;
	xscale = canvas.width / (maxx - minx); // pixel/unit

	// draw x axis and vertical grid lines
	var xAxis = document.getElementById("xAxisCanvas");
	var xContext = xAxis.getContext('2d');
	xContext.clearRect(0, 0, xAxis.width, xAxis.height);
	xContext.strokeSyle = 'black';
	xContext.lineWidth = 1;
	xContext.font = '36px arial';

	// lets try x axis first
	context.strokeSyle = "rgba(255, 255, 255, 1)";
	context.beginPath();
	var x0 = - xscale*minx; // we need to add this to x coords to move it onto
	//var xstep = Math.ceil((maxx - minx)/20);
	var xstep = Math.ceil(canvas.width / 20);
	var x = minx;
	while (x >= minx && x < maxx) {
		break;
		console.log(x);
		context.moveTo(x*xscale + x0, 0);
		context.lineTo(x*xscale + x0, canvas.height);
		x += xstep; // TODO can probs get rid of this variable
	}
	context.stroke();

	console.log(x0);
	console.log(xstep);
	console.log(minx);
	console.log(maxx);
	

	// y stuff
	miny = document.getElementById("miny").value;
	maxy = document.getElementById("maxy").value;
	yscale = canvas.height / (maxy - miny);
	var yAxis = document.getElementById("yAxisCanvas");
	var yContext = yAxis.getContext('2d');
}

function drawDirectionField() {
	// TODO draw the direction field
}

function plotDifferentialEquation(points) {
	// TODO plot the points. They should be computed by a seperate JS file 
	// with the algorithms
}