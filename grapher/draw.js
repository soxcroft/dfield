
// Drawing methods for eg axes and functions

// TODO remove the global variables

// say no to magic numbers
const GRID_LINES = 20;
const GRID_LINE_INTERVAL = 0.5; // grid lines will be some multiple of this apart
const GRID_LINE_WIDTH = 1;
const AXIS_WIDTH = 2;
const ARROW_LENGTH = 10; // pixels TODO don't make this constant, very limiting
const MIN_ARROW_LENGTH = 0.5*ARROW_LENGTH;
const MAX_ARROW_LENGTH = 2*ARROW_LENGTH;
const ARROW_WIDTH = 1
const ARROW_HEAD_FRAC = 0.5;

var canvas;
var context;
var xscale, xoffset, xstep;
var yscale, yoffset, ystep;
var minx, maxx, miny, maxy;

var yPrime, xPrime;

function initCanvas() {
	// set global variables
	canvas = document.getElementById("myCanvas");
	context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);

	minx = GRID_LINE_INTERVAL*Math.floor(Number(document.getElementById("minx").value)/GRID_LINE_INTERVAL);
	maxx = GRID_LINE_INTERVAL*Math.ceil(Number(document.getElementById("maxx").value)/GRID_LINE_INTERVAL);
	xscale = canvas.width / (maxx - minx); // pixels/unit
	xoffset = -xscale*minx; // we need to add this to x coords to show on canvas
	xstep = GRID_LINE_INTERVAL*Math.ceil((maxx - minx)/(GRID_LINES*GRID_LINE_INTERVAL));

	miny = GRID_LINE_INTERVAL*Math.floor(Number(document.getElementById("miny").value)/GRID_LINE_INTERVAL);
	maxy = GRID_LINE_INTERVAL*Math.ceil(Number(document.getElementById("maxy").value)/GRID_LINE_INTERVAL);
	yscale = canvas.width / (maxy - miny); // pixels/unit
	yoffset = canvas.height + yscale*miny; // subtract y coord from this to show on canvas
	ystep = GRID_LINE_INTERVAL*Math.ceil((maxy - miny)/(20*GRID_LINE_INTERVAL));

	// initialize x axis canvas
	var xAxis = document.getElementById("xAxisCanvas");
	var xAxisContext = xAxis.getContext('2d');
	xAxisContext.clearRect(0, 0, xAxis.width, xAxis.height);
	xAxisContext.strokeSyle = 'black';
	xAxisContext.lineWidth = 1;

	// draw the vertical grid lines and y axis labels
	context.strokeStyle = "lightgrey";
	context.lineWidth = GRID_LINE_WIDTH;
	context.beginPath();
	var x = minx + xstep;
	while (x > minx && x < maxx) {
		context.moveTo(x*xscale + xoffset, 0);
		context.lineTo(x*xscale + xoffset, canvas.height);
		xAxisContext.fillText(x, x*xscale + xoffset, xAxis.height/2);
		x = x + xstep;
	}
	context.stroke();

	// initialize y axis canvas
	var yAxis = document.getElementById("yAxisCanvas");
	var yAxisContext = yAxis.getContext('2d');
	yAxisContext.clearRect(0, 0, yAxis.width, yAxis.height);
	yAxisContext.strokeSyle = 'black';
	yAxisContext.lineWidth = 1;

	// draw the horizontal grid lines and y axis labels
	context.strokeStyle = "lightgrey";
	context.beginPath();
	var y = miny + ystep;
	while (y > miny && y < maxy) {
		context.moveTo(0, yoffset - y*yscale);
		context.lineTo(canvas.width, yoffset - y*yscale);
		yAxisContext.fillText(y, 0, yoffset - y*yscale);
		y = y + ystep;
	}
	context.stroke();

	// draw the x and y axis
	context.strokeStyle = "black";
	context.lineWidth = AXIS_WIDTH;
	context.beginPath();
	context.moveTo(xoffset, 0);
	context.lineTo(xoffset, canvas.height);
	context.moveTo(0, yoffset);
	context.lineTo(canvas.width, yoffset);
	context.stroke();
}

function drawArrows(variableLengthArrows) {
	// Draws direction fields or phase planes
	// Assumes initCanvas has been called and global variables are set
	// TODO probably shouldnt tho

	var funcs = getFunctions();
	var xPrime = funcs["xPrime"];
	var yPrime = funcs["yPrime"];

	context.lineWidth = ARROW_WIDTH;
	context.strokeStyle = "black";
	context.beginPath();

	var x = minx + xstep/2;
	while (x > minx && x < maxx) {
		var y = miny + ystep/2;
		while (y > miny && y < maxy) {
			// draw the arrow inside a cell
			let dx = xPrime(x,y);
			let dy = yPrime(x,y);
			let curLength = Math.sqrt(dx**2 + dy**2);

			if (!variableLengthArrows) {
				// scale arrow for direction field
				dx *= ARROW_LENGTH/curLength;
				dy *= ARROW_LENGTH/curLength;
			} else {
				// scale arrow for phase plane
				dx *= ARROW_LENGTH;
				dy *= ARROW_LENGTH;

				// resize if it is too big or too small
				curLength = Math.sqrt(dx**2 + dy**2);
				if (curLength > MAX_ARROW_LENGTH) {
					dx *= MAX_ARROW_LENGTH/curLength;
					dy *= MAX_ARROW_LENGTH/curLength;
				} else if (curLength < MIN_ARROW_LENGTH) {
					dx *= MIN_ARROW_LENGTH/curLength;
					dy *= MIN_ARROW_LENGTH/curLength;
				}
			}

			// draw line for arrow
			context.moveTo(xoffset + x*xscale - dx/2, yoffset - y*yscale + dy/2);
			context.lineTo(xoffset + x*xscale + dx/2, yoffset - y*yscale - dy/2);

			// draw arrow heads
			let arrowdx = ARROW_HEAD_FRAC*dx;
			let arrowdy = ARROW_HEAD_FRAC*dy;
			context.moveTo(
				xoffset + x*xscale + dx/2 - arrowdx + arrowdy/2,
				yoffset - y*yscale - dy/2 + arrowdy + arrowdx/2);
			context.lineTo(
				xoffset + x*xscale + dx/2,
				yoffset - y*yscale - dy/2);
			context.lineTo(
				xoffset + x*xscale + dx/2 - arrowdx - arrowdy/2,
				yoffset - y*yscale - dy/2 + arrowdy - arrowdx/2);

			y += ystep;
		}
		x += xstep;
	}
	context.stroke();
}

function plotPoints(points) {
	// Plots the points in the n by 2 array
	context.strokeStyle = "blue";
	context.beginPath();
	points.forEach((p, i) => {
		if (i == 0) {
			context.moveTo(xoffset + xscale*p[0], yoffset - yscale*p[1]);
		} else {
			context.lineTo(xoffset + xscale*p[0], yoffset - yscale*p[1]);
		}
	});
	context.stroke();
}
