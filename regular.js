const fs = require("fs");

let fileName = "even.json";
let parsedFile = JSON.parse(fs.readFileSync(fileName, "utf8"));
console.log(parsedFile);

console.log(EvaluateDFA(parsedFile));

function EvaluateDFA(d) {
	let state = d["initial_state"];
	let input = d["input"].split("");
	input.forEach(inputChar => {
		state = d["delta"][state][inputChar];
	});
	let accepted = (d["accept_states"].indexOf(state) != -1);
	return accepted;
}

