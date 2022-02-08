
/* SCANNER */

// TODO make constants and functions include case insensitive

// Math constants
CONSTANTS = ['E', 'PI', 'SQRT2', 'SQRT1_2', 'LN2', 'LN10', 'LOG2E', 'LOG10E'];
// Math functions
FUNCTIONS = ['abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'cbrt',
	'cos', 'cosh', 'exp', 'log', 'log2', 'log10', 'sin', 'sinh', 'sqrt', 'tan',
	'tanh'];
TOKENS = ["FUNC", "X", "Y", "NUM", "ADD", "SUB", "MUL", "DIV", "EXP", "LPAR", 
	"RPAR", "EOE"];
TOKEN_STRINGS = ["function", "x", "y", "number", "+", "-", "*", "/", "^", "(", 
	")", "end-of-expression"];
TOKEN_TYPES = {};
TOKENS.forEach((x, i) => { TOKEN_TYPES[x] = i; }); // homemade enum

// Scanner global variables
var ch, pos, expression;

// Parser global variables
// Token class, more a structure
class Token {
	constructor() {
		var type, lexeme;
	}
}
var nextToken = new Token(); // lookahead token

// Global error message, initialized in initScanner, written to by logError
var errorMessage;

function logError(msg) {
	// only write to error message if it is the empty string
	if (errorMessage == '') {
		errorMessage = msg;
	}
}

function isAlpha(ch) {
	// Check if a character is in the alphabet, assumes ch is a char
	return /[A-Za-z]/.test(ch);
}

function isDigit(ch) {
	// Check if a character is a digit, also assumes ch is a char
	return /[0-9]/.test(ch);
}

function initScanner(expressionString) {
	// Initializes the scanner
	pos = 0;
	expression = expressionString;
	errorMessage = '';
	nextChar();
}

function get(token) {
	// get the next lexeme in the expression
	
	// skip white space
	while (ch == ' ' || ch == '\n' || ch == '\t') {
		nextChar();
	}

	if (ch != -1) {

		// is alpha
		if (isAlpha(ch)) {
			processString(token);
		} else if (isDigit(ch)) {
			processNumber(token);
		} else if (ch == '(' || ch == '[') {
			token.type = TOKEN_TYPES["LPAR"];
			nextChar();
		} else if (ch == ')' || ch == ']') {
			token.type = TOKEN_TYPES['RPAR'];
			nextChar();
		} else if (ch == '+') {
			token.type = TOKEN_TYPES['ADD'];
			nextChar();
		} else if (ch == '-') {
			token.type = TOKEN_TYPES['SUB'];
			nextChar();
		} else if (ch == '*') {
			token.type = TOKEN_TYPES['MUL'];
			nextChar();
		} else if (ch == '/') {
			token.type = TOKEN_TYPES['DIV'];
			nextChar();
		} else if (ch == '^') {
			token.type = TOKEN_TYPES['EXP'];
			nextChar();
		} else {
			logError(`Illegal character ${ch} at position ${pos}`);
			token.type = TOKEN_TYPES["EOE"]
		}

	} else {
		token.type = TOKEN_TYPES["EOE"];
	}
}

function processString(token) {
	// Read next string and return the token type found
	token.lexeme = ''; // reset
	start = pos // for error messages

	while (isAlpha(ch)) {
		token.lexeme = token.lexeme + ch;
		nextChar();
	}

	if (token.lexeme == 'x') {
		token.type = TOKEN_TYPES["X"];
	} else if (token.lexeme == 'y') {
		token.type = TOKEN_TYPES["Y"];
	} else if (FUNCTIONS.includes(token.lexeme.toLowerCase())) {
		token.type = TOKEN_TYPES["FUNC"];
	} else if (CONSTANTS.includes(token.lexeme.toLowerCase())) {
		token.type = TOKEN_TYPES["NUM"];
	} else {
		ch = -1;
		token.type = TOKEN_TYPES["EOE"];
		logError(`Invalid function/variable name at pos ${start}`);
	}
}

function processNumber(token) {
	// Read number from the input. Allows decimals
	token.lexeme = '';
	var decimal = false;
	while ((isDigit(ch) && ch != -1) || (ch == '.' && !decimal)) {
		if (ch == '.') {
			decimal = true;
		}
		token.lexeme = token.lexeme + ch;
		nextChar();
	}
	token.type = TOKEN_TYPES["NUM"];
}

function nextChar() {
	// Set ch equal to the next character in the expression being read, and
	// increment the position in the string
	if (pos < expression.length) {
		ch = expression[pos];
		pos++;
	}
	else {
		ch = -1; // end of expression convention
	}
}

function getTokenStr(type) {
	// Converts a token type to its string representation, for error messages
	return TOKEN_STRINGS[type];
}

// TEST

function testScanner(str) {
	// Tokenizes str and prints each lexeme it reads on a new line
	console.log(str);

	initScanner(str);
	var token = new Token();

	get(token);
	if (token.type == TOKEN_TYPES["NUM"] || token.type == TOKEN_TYPES["FUNC"]) {
		console.log(token.lexeme);
	} else {
		console.log(getTokenStr(token.type));
	}

	while (token.type != TOKEN_TYPES["EOE"]) {
		get(token);
		if (token.type == TOKEN_TYPES["NUM"] || token.type == TOKEN_TYPES["FUNC"]) {
			console.log(token.lexeme);
		} else {
			console.log(getTokenStr(token.type));
		}
	}

	console.log();
}

/* PARSER */

/* debugging stuff */

DEBUGGING_ENABLED = true;
indent = 0;

function debugStart(production) {
	if (DEBUGGING_ENABLED) {
		console.log(' '.repeat(indent) + production);
		indent += 2;
	}
}

function debugEnd(production) {
	if (DEBUGGING_ENABLED) {
		indent -= 2;
		console.log(' '.repeat(indent) + production);
	}
}

// parsing stuff

function expect(type) {
	// 'Eats' token and gets the next one
	if (nextToken.type == type) {
		get(nextToken);
	} else {
		logError(`Expected ${getTokenStr(type)} but found ${getTokenStr(nextToken.type)} at pos ${pos}`);
	}
}

function parseFunction() {
	// <expression> "end-of-expression"
	debugStart("<function>");

	parseExpression();
	expect(TOKEN_TYPES["EOE"]);

	debugEnd("</function>");
}

function parseExpression() {
	// ["-"] <term> {<addop> <term>}
	debugStart("<expression>");

	if (nextToken.type == TOKEN_TYPES["SUB"]) {
		get(nextToken);
	}

	parseTerm();

	while (nextToken.type == TOKEN_TYPES["ADD"] || nextToken.type == 
			TOKEN_TYPES["SUB"]) {
		get(nextToken);
		parseTerm();
	}
	
	debugEnd("</expression>");
}

function parseTerm() {
	// <factor> {<mulop> <factor>}
	debugStart("<term>");

	parseFactor();

	while (nextToken.type == TOKEN_TYPES["MUL"] || nextToken.type == 
			TOKEN_TYPES["DIV"] || nextToken.type == TOKEN_TYPES["EXP"]) {
		get(nextToken);
		parseFactor();
	}

	debugEnd("</term>");
}

function parseFactor() {
	// <id> [ "(" <expr> ")" ] | <variable> | <num> | "(" <expr> ")"
	debugStart("<factor>");

	if (nextToken.type == TOKEN_TYPES["FUNC"]) {
		get(nextToken);
		expect(TOKEN_TYPES["LPAR"]);
		parseExpression();
		expect(TOKEN_TYPES["RPAR"]);
	} else if (nextToken.type == TOKEN_TYPES["X"] || nextToken.type == 
			TOKEN_TYPES["Y"]) {
		get(nextToken);
	} else if (nextToken.type == TOKEN_TYPES["NUM"]) {
		get(nextToken);
	} else if (nextToken.type == TOKEN_TYPES["LPAR"]) {
		get(nextToken);
		parseExpression();
		expect(TOKEN_TYPES["RPAR"]);
	} else {
		logError(`Expected a factor but found ${getTokenStr(nextToken.type)} at pos ${pos}`);
	}

	debugEnd("</factor>");
}

function strToFunc(expression) {
	// TODO store the new RegExp so you don't keep computing it
	// Converts a string to a function after it has been parsed
	CONSTANTS.forEach(c => {
		expression = expression.replace(new RegExp("\\b" + c + "\\b", "gi"), "Math." + c);
	});
	FUNCTIONS.forEach(f => {
		expression = expression.replace(new RegExp("\\b" + f + "\\b", "gi"), "Math." + f);
	});
	expression = expression.replace(/\^/g, "**");
	return eval("(x,y) => {return " + expression + ";};");
}

function testParser(str) {
	// Make sure debugging is enabled
	initScanner(str);
	get(nextToken);
	parseFunction();
	console.log();
}

function parse(funcStr) {
	// Initializes scanner, parses expression and returns error message or
	// empty string if function is valid
	initScanner(funcStr);
	get(nextToken);
	parseFunction();
	return errorMessage;
}

/*
// TEST

testScanner("5()sin+5");
testScanner("5 + 5 * sin(100^12) - x + y*12");

testParser("5 + 5");
testParser("5 + 5 * 3 ^ 2");
testParser("5 + (5 + (5 + (3 * 2 * (4 * 2))))");
testParser("sin(cos(log(5*(5*(5+2)))))");
testParser("(5)");
*/
