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

function EvaluateNFA(n) {
	let states = n["initial_state"];
	const input = n["input"].split("");
	input.forEach(inputChar => {
		let statebuff = [];
		states.forEach(st => {
			const e = n["delta"][st]["e"];
			if (e) statebuff = statebuff.concat(e);
		});
		states = states.concat(statebuff);
		statebuff = [];
		states.forEach(st => {
			const buf = n["delta"][st][inputChar];
			if (buf) statebuff = statebuff.concat(buf);
		});
		states = statebuff;
	});
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
	"*": [2, "r"]
}
const prec = function (op) {
	return res[op] ? res[op] : 0;
};
const notBasic = ["*", "+", "(", ")"];
const ops = ["+", "*"];

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

function RegexToNFA2(regex) {
	let tokens = regex.split("");
	//console.log(tokens);
	let nfa = blankNFA();
	let output = [];
	let opstack = [];
	let buffer = [];
	for (let i = 0; i < tokens.length; i++) {
		let curr = tokens[i];
		let peek = opstack[opstack.length-1];
		if (!notBasic.includes(curr)) {
			// basic
			buffer.push(curr);
			let ext = tokens[i+1];
			if (ext && notBasic.includes(ext)) {
				output.push(buffer.join(""));
				buffer = []
			} else if (!ext) {
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

function RegexToNfa(regex) {
	let staten = 1;
	let nfa = {
		"initial_state": [0],
		"states": 1,
		"alphabet": alpha,
		"accept_states": [],
		"delta": {
			"0": {
				"e": [1]
			}
		}
	};

	let opstack = []
	let regexChars = regex.split("");
	for (let i = 0; i < regexChars.length; i++) {
		let currChar = regexChars[i];
		if (currChar == "(") {
			opstack.push(staten);
		} else if (currChar == ")") { 
			if (regexChars[i + 1] && regexChars[i + 1] == "*") {
				let starback = opstack.pop();
				// construct epsilon here
				nfa["delta"][staten] = {};
				nfa["delta"][staten]["e"] = [starback, staten + 1];
				if (nfa["delta"][starback]["e"]) {
					nfa["delta"][starback]["e"].push(staten);
				} else {
					nfa["delta"][starback]["e"] = [staten];
				}
				staten += 1;
				nfa["accept_states"] = [staten];
			} else if (regexChars[i + 1] && regexChars[i + 1] == "+") {
				let unionback = opstack.pop();
				if (!unionback) {
					unionback = 0;
				}
				nfa["delta"][staten-1]["e"] 
				nfa["delta"][unionback-1]["e"].push();
				nfa["accept_states"].push(staten);
				nfa["accept_states"].push(staten);

			}
		} else if (currChar == "*") {
			nfa["delta"][staten] = {};
			nfa["delta"][staten]["e"] = [staten - 3, staten + 1];
			nfa["delta"][staten - 3]["e"] = [staten]; //mark
			if (nfa["delta"][staten - 3]["e"]) {
				nfa["delta"][staten - 3]["e"].push(staten);
			} else {
				nfa["delta"][staten - 3]["e"] = [staten];
			}
			staten += 1;
			nfa["accept_states"].pop();
			nfa["accept_states"].push(staten);
			
		} else if (currChar == "+") {


		} else {
			nfa["delta"][staten] = {};
			nfa["delta"][staten][currChar] = [staten + 1];
			staten += 1;
			nfa["delta"][staten] = {};
			nfa["delta"][staten]["e"] = [staten + 1];
			nfa["accept_states"].pop();
			nfa["accept_states"].push(staten);
		}
	}

	return nfa;
}

let b = RegexToNFA2("ab(ab)+(ba)+(bb)*");
console.log(b);
b = RegexToNFA2("(aa)+(bb)");
console.log(b);
b = RegexToNFA2("w(hy)+(ho)");
console.log(b);
b = RegexToNFA2("why+o");
console.log(b);
b = RegexToNFA2("who*m");
console.log(b);
b = RegexToNFA2("wh(at)*");
console.log(b);

/*
Object.keys(b["delta"]).forEach(key => {
	console.log(key + " - " + b["delta"][key]);
	console.log(b["delta"][key])
});
b["input"] = "aaa";
let res = EvaluateNFA(b);
console.log(res);
b["input"] = "aaaba";
res = EvaluateNFA(b);
console.log(res);
*/



module.exports = {
	EvaluateDFA,
	EvaluateNFA
}
