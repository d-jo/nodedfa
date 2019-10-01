const fs = require("fs");

let fileName = "substring.json";
let parsedFile = JSON.parse(fs.readFileSync(fileName, "utf8"));
console.log(parsedFile);

console.log(EvaluateNFA(parsedFile));

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
