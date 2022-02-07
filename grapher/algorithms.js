
// algorithms for approximating solutions to differential equations

// TODO global variables causing issues

const STEPS = 10000;

function eulersMethod(x0, y0, xPrime, yPrime, stepsize) {
	// y_n+1 = y_n + h*f(t_n, y_n)
	// t_n+1 = t_n + stepsize
	// For direction fields, xPrime should return 1 so newx = x + stepsize*1
	// For phase planes the functions aren't functions of time so we don't keep
	// track of it, not sure if this is the correct implementation though
	var points = new Array(STEPS + 1);
	points[0] = [x0, y0];
	var newx, newy, x = x0, y = y0;
	for (let i = 1; i <= STEPS; i++) {
		newy = y + stepsize*yPrime(x, y);
		newx = x + stepsize*xPrime(x, y);
		x = newx;
		y = newy;
		points[i] = [x, y];
	}
	return points;
}

function modifiedEulersMethod(x0, y0, xPrime, yPrime, stepsize) {
	// Takes the arithmetic average of the slopes at x_n and x_n+1 and uses it 
	// to approximate y_n+1
	var points = new Array(STEPS + 1);
	points[0] = [x0, y0];
	var newx, newy, x = x0, y = y0;
	for (let i = 1; i <= STEPS; i++) {
		let ystar = y + stepsize*yPrime(x, y);
		let xstar = x + stepsize*xPrime(x, y);
		newy = y + 0.5*stepsize*(yPrime(x, y) + yPrime(x + stepsize, ystar));
		newx = x + 0.5*stepsize*(xPrime(x, y) + xPrime(xstar, y + stepsize));
		x = newx;
		y = newy;
		points[i] = [x, y];
	}
	return points;
}

function rungeKuttaMethod(x0, y0, xPrime, yPrime, stepsize) {
	// 4th order Runge-Kutta method
	var points = new Array(STEPS + 1);
	var x = x0, y = y0;
	var m1, m2, m3, m4, k1, k2, k3, k4;
	points[0] = [x, y];
	for (let i = 1; i <= STEPS; i++) {
		m1 = xPrime(x, y);
		k1 = yPrime(x, y);
		m2 = xPrime(x + 0.5*stepsize*m1, y + 0.5*stepsize*k1);
		k2 = yPrime(x + 0.5*stepsize*m1, y + 0.5*stepsize*k1);
		m3 = xPrime(x + 0.5*stepsize*m2, y + 0.5*stepsize*k2);
		k3 = yPrime(x + 0.5*stepsize*m2, y + 0.5*stepsize*k2);
		m4 = xPrime(x + stepsize*m3, y + stepsize*k3);
		k4 = yPrime(x + stepsize*m3, y + stepsize*k3);
		x += (stepsize/6)*(m1 + 2*m2 + 2*m3 + m4);
		y += (stepsize/6)*(k1 + 2*k2 + 2*k3 + k4);
		points[i] = [x, y];
	}
	return points;
}

function adamsBashforthMoultonMethod(x0, y0, xPrime, yPrime, stepsize) {
	// Multi-step method for approximating ode
	var points = new Array(STEPS + 1);
	var x = x0, y = y0;
	points[0] = [x, y];
	
	// Use Runge-Kutta method to find next 3 values
	var m1, m2, m3, m4, k1, k2, k3, k4;
	for (let i = 1; i <= Math.min(STEPS, 3); i++) {
		m1 = xPrime(x, y);
		k1 = yPrime(x, y);
		m2 = xPrime(x + 0.5*stepsize*m1, y + 0.5*stepsize*k1);
		k2 = yPrime(x + 0.5*stepsize*m1, y + 0.5*stepsize*k1);
		m3 = xPrime(x + 0.5*stepsize*m2, y + 0.5*stepsize*k2);
		k3 = yPrime(x + 0.5*stepsize*m2, y + 0.5*stepsize*k2);
		m4 = xPrime(x + stepsize*m3, y + stepsize*k3);
		k4 = yPrime(x + stepsize*m3, y + stepsize*k3);
		x += (stepsize/6)*(m1 + 2*m2 + 2*m3 + m4);
		y += (stepsize/6)*(k1 + 2*k2 + 2*k3 + k4);
		points[i] = [x, y];
	}

	// Initialize array of derivatives, used so that we don't recompute values
	var yPrimes = new Array(STEPS + 1);
	var xPrimes = new Array(STEPS + 1);
	for (let i = 0; i < Math.min(STEPS, 4); i++) {
		xPrimes[i] = xPrime(points[i][0], points[i][1]);
		yPrimes[i] = yPrime(points[i][0], points[i][1]);
	}
	
	// Now for the method
	var xstar, ystar, xprimehelper, yprimehelper;
	for (let i = 4; i < STEPS; i++) {
		// Use Adams-Bashforth predictor to find x* and y*
		xstar = points[i-1][0] + (stepsize/24)*(55*xPrimes[i-1] - 59*xPrimes[i-2]
			+ 37*xPrimes[i-3] - 9*xPrimes[i-4]);
		ystar = points[i-1][1] + (stepsize/24)*(55*yPrimes[i-1] - 59*yPrimes[i-2]
			+ 37*yPrimes[i-3] - 9*yPrimes[i-4]);

		// Use Adams-Moulton corrector  to find y_n+1
		xprimehelper = xPrime(xstar, ystar);
		x = points[i-1][0] + (stepsize/24)*(9*xprimehelper + 
			19*xPrimes[i-1] - 5*xPrimes[i-2] + xPrimes[i-3]);

		yprimehelper = yPrime(xstar, ystar);
		y = points[i-1][1] + (stepsize/24)*(9*yprimehelper + 
			19*yPrimes[i-1] - 5*yPrimes[i-2] + yPrimes[i-3]);

		points[i] = [x, y];

		// and i think use these computed values to update derivatives memo
		// (rather than xprimehelper and yprimehelper)
		xPrimes[i] = xPrime(x, y);
		yPrimes[i] = yPrime(x, y);
	}

	return points;
}

