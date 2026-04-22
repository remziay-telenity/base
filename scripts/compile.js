const solc = require("solc");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(__dirname, "../contracts/Counter.sol"),
  "utf8"
);

const input = {
  language: "Solidity",
  sources: { "Counter.sol": { content: source } },
  settings: {
    outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } },
    optimizer: { enabled: true, runs: 200 },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const errors = output.errors.filter((e) => e.severity === "error");
  if (errors.length) {
    console.error(errors);
    process.exit(1);
  }
}

const contract = output.contracts["Counter.sol"]["Counter"];
const artifact = {
  abi: contract.abi,
  bytecode: "0x" + contract.evm.bytecode.object,
};

fs.writeFileSync(
  path.join(__dirname, "../src/lib/counterArtifact.json"),
  JSON.stringify(artifact, null, 2)
);

console.log("Compiled Counter.sol → src/lib/counterArtifact.json");
