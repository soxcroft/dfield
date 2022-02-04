
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
var next_token = new Token(); // lookahead token

// Global error message, initialized in init_scanner, written to by error message
var error_message;

function log_error(msg) {
	// only write to error message if it is the empty string
	if (error_message == '') {
		error_message = msg;
	}
}

function is_alpha(ch) {
	// Check if a character is in the alphabet, assumes ch is a char
	return /[A-Za-z]/.test(ch);
}

function is_numeric(ch) {
	// Check if a character is a number, also assumes ch is a char
	return /[0-9]/.test(ch);
}

function init_scanner(expression_string) {
	pos = 0;
	expression = expression_string;
	error_message = '';
	next_char();
}

function get(token) {
	
	// skip white space
	while (ch == ' ' || ch == '\n' || ch == '\t') {
		next_char();
	}

	if (ch != -1) {

		// is alpha
		if (is_alpha(ch)) {
			process_function(token);
		} else if (is_numeric(ch)) {
			process_number(token);
		} else if (ch == '(' || ch == '[') {
			token.type = TOKEN_TYPES["LPAR"];
			next_char();
		} else if (ch == ')' || ch == ']') {
			token.type = TOKEN_TYPES['RPAR'];
			next_char();
		} else if (ch == '+') {
			token.type = TOKEN_TYPES['ADD'];
			next_char();
		} else if (ch == '-') {
			token.type = TOKEN_TYPES['SUB'];
			next_char();
		} else if (ch == '*') {
			token.type = TOKEN_TYPES['MUL'];
			next_char();
		} else if (ch == '/') {
			token.type = TOKEN_TYPES['DIV'];
			next_char();
		} else if (ch == '^') {
			token.type = TOKEN_TYPES['EXP'];
			next_char();
		} else {
			log_error(`Illegal character ${ch} at position ${pos}`);
			token.type = TOKEN_TYPES["EOE"]
		}

	} else {
		token.type = TOKEN_TYPES["EOE"];
	}
}

function process_function(token) {
	token.lexeme = ''; // reset
	start = pos // for error messages

	while (is_alpha(ch)) {
		token.lexeme = token.lexeme + ch;
		next_char();
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
		log_error(`Invalid function/variable name at pos ${start}`);
	}
}

function process_number(token) {
	token.lexeme = '';
	var decimal = false;
	while ((is_numeric(ch) && ch != -1) || (ch == '.' && !decimal)) {
		if (ch == '.') {
			decimal = true;
		}
		token.lexeme = token.lexeme + ch;
		next_char();
	}
	token.type = TOKEN_TYPES["NUM"];
}

function next_char() {
	if (pos < expression.length) {
		ch = expression[pos];
		pos++;
	}
	else {
		ch = -1; // end of expression convention
	}
}

function get_token_str(type) {
	return TOKEN_STRINGS[type];
}

// TEST

function test_scanner(str) {

	console.log(str);

	init_scanner(str);
	var token = new Token();

	get(token);
	if (token.type == TOKEN_TYPES["NUM"] || token.type == TOKEN_TYPES["FUNC"]) {
		console.log(token.lexeme);
	} else {
		console.log(get_token_str(token.type));
	}

	while (token.type != TOKEN_TYPES["EOE"]) {
		get(token);
		if (token.type == TOKEN_TYPES["NUM"] || token.type == TOKEN_TYPES["FUNC"]) {
			console.log(token.lexeme);
		} else {
			console.log(get_token_str(token.type));
		}
	}

	console.log();
}

/* PARSER */

/* debugging stuff */

DEBUGGING_ENABLED = true;
indent = 0;

function debug_start(production) {
	if (DEBUGGING_ENABLED) {
		console.log(' '.repeat(indent) + production);
		indent += 2;
	}
}

function debug_end(production) {
	if (DEBUGGING_ENABLED) {
		indent -= 2;
		console.log(' '.repeat(indent) + production);
	}
}

// parsing stuff

function expect(type) {
	if (next_token.type == type) {
		get(next_token);
	} else {
		// TODO maybe abort somehow too
		log_error(`Expected ${get_token_str(type)} but found ${get_token_str(next_token.type)} at pos ${pos}`);
	}
}

function parse_expression() {
	// ["-"] <term> {<addop> <term>}
	debug_start("<expression>");

	if (next_token.type == TOKEN_TYPES["SUB"]) {
		get(next_token);
	}

	parse_term();

	while (next_token.type == TOKEN_TYPES["ADD"] || next_token.type == 
			TOKEN_TYPES["SUB"]) {
		get(next_token);
		parse_term();
	}

	debug_end("</expression>");
}

// TODO how to handle exponent?

function parse_term() {
	// <factor> {<mulop> <factor>}
	debug_start("<term>");

	parse_factor();

	while (next_token.type == TOKEN_TYPES["MUL"] || next_token.type == 
			TOKEN_TYPES["DIV"] || next_token.type == TOKEN_TYPES["EXP"]) {
		get(next_token);
		parse_factor();
	}

	debug_end("</term>");
}

function parse_factor() {
	// <id> [ "(" <expr> ")" ] | <variable> | <num> | "(" <expr> ")"
	debug_start("<factor>");

	if (next_token.type == TOKEN_TYPES["FUNC"]) {
		get(next_token);
		expect(TOKEN_TYPES["LPAR"]);
		parse_expression();
		expect(TOKEN_TYPES["RPAR"]);
	} else if (next_token.type == TOKEN_TYPES["X"] || next_token.type == 
			TOKEN_TYPES["Y"]) {
		// TODO probably change x and y type to var
		get(next_token);
	} else if (next_token.type == TOKEN_TYPES["NUM"]) {
		get(next_token);
	} else if (next_token.type == TOKEN_TYPES["LPAR"]) {
		get(next_token);
		parse_expression();
		expect(TOKEN_TYPES["RPAR"]);
	} else {
		// TODO errorsssss
		log_error(`Expected a factor but found ${get_token_str(next_token.type)} at pos ${pos}`);
	}

	debug_end("</factor>");
}

function str_to_func(expression) {
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

function test_parser(str) {
	// make sure debugging is enabled
	init_scanner(str);
	get(next_token);
	parse_expression();
	console.log();
}

function checkFunction(funcStr) {
	// initializes scanner, parses expression and returns error message or
	// empty string if function is valid
	init_scanner(funcStr);
	get(next_token);
	parse_expression();
	return error_message;
}

/* TODO now I need a method probably similar to test_parser which inits scanner
 * and checks the expression, setting an error message where necessary to
 * display and maybe a boolean so that the html knows if the expression is
 * valid?
 */

// TEST

/*
test_scanner("5()sin+5");
test_scanner("5 + 5 * sin(100^12) - x + y*12");

test_parser("5 + 5");
test_parser("5 + 5 * 3 ^ 2");
test_parser("5 + (5 + (5 + (3 * 2 * (4 * 2))))");
test_parser("sin(cos(log(5*(5*(5+2)))))");
test_parser("(5)");
*/
