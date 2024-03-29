const fs = require("fs");

// let fileName = "substring.json";
// let parsedFile = JSON.parse(fs.readFileSync(fileName, "utf8"));
// console.log(parsedFile);
// 
// console.log(EvaluateNFA(parsedFile));

function EvaluateDFA(d) {
	let state = d["initial_state"];
	const input = d["input"].split("");
	input.forEach(inputChar => {
		state = d["delta"][state][inputChar];
	});
	return (d["accept_states"].indexOf(state) != -1);
}


const E_DEPTH = 10;

function EvaluateNFA(n) {
	let states = [n["initial_state"]];
	const input = n["input"].split("");
	input.forEach(inputChar => {
		let statebuff = [];
		for (let i = 0; i < E_DEPTH; i++) {
			statebuff = [];
			states.forEach(st => {
				const e = n["delta"][st]["e"];
				if (e && !statebuff.includes(e) && !states.includes(e)) { 
					statebuff = statebuff.concat(e);
				}
			});
			//states = states.concat(statebuff);
			statebuff.forEach(i => {
				if (!states.includes(i)) {
					states.push(i);
				}
			});
		}
		statebuff = [];
		// st
		//console.log(inputChar + " | " + states);
		states.forEach(st => {
			const buf = n["delta"][st][inputChar];
			if (buf) statebuff = statebuff.concat(buf);
		});
		states = statebuff;
	});
	for (let i = 0; i < E_DEPTH; i++) {
		statebuff = [];
		//console.log(states);
		states.forEach(st => {
			const e = n["delta"][st]["e"];
			if (e && !statebuff.includes(e) && !states.includes(e)) { 
				statebuff = statebuff.concat(e)
			}
		});
		//states = states.concat(statebuff);
		statebuff.forEach(i => {
			if (!states.includes(i)) {
				states.push(i);
			}
		});
	}
	//console.log("===");
	//console.log(states);
	
	return n["accept_states"].some(r => states.includes(r));
}

function from_concat(regexstr) {
	let nfa = {
		"initial_state": [0],
		"states": regexstr.length + 1,
		"delta": {
			"0": {
				"e": [1]
			}
		}
	}
	let staten = 1
	regexstr.split("").forEach(character => {
		let newState = {}
		newState[character] = [staten+1]
		nfa["delta"][staten] = newState;
		staten += 1;
	})
	nfa["accept_states"] = [staten];
	return nfa;
}

const alpha = []
for (let i = 48; i <= 57; i++) {
	alpha.push(String.fromCharCode(i));
}
for (let i = 65; i <= 90; i++) {
	alpha.push(String.fromCharCode(i));
}
for (let i = 97; i <= 122; i++) {
	alpha.push(String.fromCharCode(i));
}

const res = {
	"+": [1, "l"],
	"&": [2, "l"],
	"*": [3, "l"]
}
const prec = function (op) {
	return res[op] ? res[op] : 0;
};
const notBasic = ["*", "+", "&", "(", ")"];
const ops = ["+", "*", "&"];

function blankNFA() {
	let nfa = {
		"initial_state": [1],
		"states": 2,
		"alphabet": alpha,
		"accept_states": [0],
		"delta": {
			"0": {
				"e": [1]
			},
		}
	};
	return nfa;
}


function regexToPolish(regex) {
	let tokens = regex.split("");
	//console.log(tokens);
	let output = [];
	let opstack = [];
	let buffer = [];
	for (let i = 0; i < tokens.length; i++) {
		let curr = tokens[i];
		let peek = opstack[opstack.length-1];
		if (!notBasic.includes(curr)) {
			// basic
			// buffer.push(curr);
			// ext = next token
			let ext = tokens[i+1];
			// if ext exists and its not a basic char
			if (ext) {
				if (ops.includes(ext)) {
					// + or *
					if (buffer.length > 0) {
						output.push(buffer.join(""));
						buffer = []
					}
				}
				if (notBasic.includes(ext)) {
					buffer.push(curr)
					output.push(buffer.join(""));
					buffer = []
				} else {
					buffer.push(curr)
				}

			} else if (!ext) {
				buffer.push(curr)
				output.push(buffer.join(""));
			}
		} else if (ops.includes(curr)) {
			// operator
			let p = prec(curr);
			let topp = prec(peek);
			while (((topp[0] > p[0]) || (topp[0] == p[0] && topp[1] == "l")) && peek != "(") {
				output.push(opstack.pop());
				// re-peek
				peek = opstack[opstack.length-1];
				topp = prec(peek);
			}
			opstack.push(curr)
		} else if (curr == "(") {
			// left
			opstack.push(curr);
		} else if (curr == ")") {
			// right
			while (peek != "(") {
				output.push(opstack.pop());
				peek = opstack[opstack.length-1];
			}
			if (peek == "(") {
				opstack.pop(); // discard
			}
		}
	}
	while (opstack.length > 0) {
		output.push(opstack.pop());
	}
	return output
}

function RegexToNFA2(regex, implicit) {
	console.log(regex);
	let stack
	if (implicit) {
		stack = regexToPolish(implicitToExplicitConcat(regex));
	} else {
		stack = regexToPolish(regex);
	}

	console.log(stack);
	return regexRecursive(stack);

}

function baseNFA(r, st) {
	let nfa = {
		"initial_state": [st],
		"states": 4,
		"accept_states": [st+3],
		"delta": {
		}
	};
	for (let i = 0; i < 4; i++) {
		nfa["delta"][st+i] = {};
	}
	nfa["delta"][st]["e"] = [st+1];
	nfa["delta"][st+1][r] = [st+2];
	nfa["delta"][st+2]["e"] = [st+3];
	nfa["delta"][st+3] = {};
	staten += 4;
	return nfa;
}

function kleen(base) {
	let end = base["accept_states"].slice();
	let start = base["initial_state"].slice();
	let newDelta = base["delta"];
	// consider just linking the start and end up with epsilons directly, instead
	// of trying to add another couple states.
	//
	
	if (newDelta[start[0]]["e"]) {
		newDelta[start[0]]["e"].push(end[0]);
	} else {
		newDelta[start[0]]["e"] = [end[0]];
	}
	if (newDelta[end[0]]["e"]) {
		newDelta[end[0]]["e"].push(start[0]);
	} else {
		newDelta[end[0]]["e"] = [start[0]];
	}


	let nfa = {
		"initial_state": start,
		"states": base["states"],
		"accept_states": end,
		"delta": newDelta,
	}
	return nfa;
}

function prepend(base, prefix) {
	let nfa = {
		"initial_state": prefix.initial_state,
		"states": base.states + prefix.states,
		"accept_states": base.accept_states,
		"delta": {
		}
	};

	let newDelta = prefix["delta"];
	let keys = Object.keys(base["delta"]);
	for (let i = 0; i < keys.length; i++) {
		newDelta[keys[i]] = base["delta"][keys[i]];
	}
	if (newDelta[prefix["accept_states"][0]]["e"]) {
		newDelta[prefix["accept_states"][0]]["e"].push(base["initial_state"][0]);
	} else {
		newDelta[prefix["accept_states"][0]]["e"] = [base["initial_state"][0]];
	}
	nfa["delta"] = newDelta;
	return nfa;
}

function union(l1, l2) {
	let nfa = {
		"initial_state": l1["initial_state"],
		"states": l1["states"] + l2["states"],
		"accept_states": l1["accept_states"],
		"delta": {}
	}

	let newDelta = l1["delta"]

	let keys = Object.keys(l2["delta"]);
	for (let obj in keys) {
		newDelta[keys[obj]] = l2["delta"][keys[obj]];
	}

	if (newDelta[l1["initial_state"][0]]["e"]) {
		newDelta[l1["initial_state"][0]]["e"].push(l2["initial_state"]);
	} else {
		newDelta[l1["initial_state"][0]]["e"] = [l2["initial_state"]];
	}
	//console.log(l2["accept_states"])

	if (newDelta[l2["accept_states"]]["e"]) {
		newDelta[l2["accept_states"]]["e"].push(l1["accept_states"])
	} else {
		newDelta[l2["accept_states"]]["e"] = l1["accept_states"]
	}

	nfa["delta"] = newDelta;
	return nfa;
}


var staten = 0
function regexRecursive(tokenStack) {
	//base case
	//recursive case
	console.log(tokenStack);
	console.log(tokenStack.length);
	let curr = tokenStack.pop();
	console.log(tokenStack)
	if (curr == "*") {
		return kleen(regexRecursive(tokenStack));
	} else if (curr == "&") {
		let l1 = regexRecursive(tokenStack);
		let l2 = regexRecursive(tokenStack);
		return prepend(l1, l2);
	} else if (curr == "+") {
		let l1 = regexRecursive(tokenStack);
		let l2 = regexRecursive(tokenStack);
		return union(l1, l2);
	} else {
		return baseNFA(curr, staten);
	}
}

function implicitToExplicitConcat(regex) {
	console.log(regex)
	let tokens = regex.split("");
	let copy = tokens.slice();
	let offset = 0;
	for (let i = 0; i < tokens.length-1; i++) {
		let curr = tokens[i];
		let peek = tokens[i+1];
		if (peek != "*" && peek != "+" && peek != "&" && peek != ")" && curr != "+" && curr != "(") {
			copy.splice(i + 1 + offset++, 0, "&");
		}
	}
	return copy.join("");
}

function logNFA(nfa) {
	console.log("Initial state: \t" + nfa["initial_state"]);
	console.log("Accept states: \t" + nfa["accept_states"]);
	console.log("Total states: \t" + nfa["states"]);
	let keys = Object.keys(nfa["delta"]);
	keys.forEach((k) => {
		let obj = nfa["delta"][k];
		Object.keys(obj).forEach(k2 => {
			console.log(k + " | " + k2 + " | " + obj[k2]);
		})
	})
}





let b = RegexToNFA2("(hello)+(home)", true);
b["input"] = "helo";
console.log(b);
logNFA(b);
console.log("---");
console.log(EvaluateNFA(b));



module.exports = {
	EvaluateDFA,
	EvaluateNFA
}
