const solc = require("solc");
const fs = require("fs");
const path = require("path");

const CONTRACTS = [
  { file: "Counter.sol", name: "Counter", out: "counterArtifact.json" },
  { file: "SimpleToken.sol", name: "SimpleToken", out: "simpleTokenArtifact.json" },
  { file: "SimpleNFT.sol", name: "SimpleNFT", out: "simpleNFTArtifact.json" },
];

const sources = {};
for (const c of CONTRACTS) {
  sources[c.file] = {
    content: fs.readFileSync(path.join(__dirname, "../contracts", c.file), "utf8"),
  };
}

const input = {
  language: "Solidity",
  sources,
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

for (const c of CONTRACTS) {
  const contract = output.contracts[c.file][c.name];
  const artifact = {
    abi: contract.abi,
    bytecode: "0x" + contract.evm.bytecode.object,
  };
  fs.writeFileSync(
    path.join(__dirname, "../src/lib", c.out),
    JSON.stringify(artifact, null, 2)
  );
  console.log(`Compiled ${c.file} → src/lib/${c.out}`);
}
