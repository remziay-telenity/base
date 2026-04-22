import { NextRequest, NextResponse } from "next/server";
import solc from "solc";

export async function POST(req: NextRequest) {
  try {
    const { source } = await req.json();
    if (!source || typeof source !== "string") {
      return NextResponse.json({ error: "No source code provided" }, { status: 400 });
    }

    const input = {
      language: "Solidity",
      sources: { "contract.sol": { content: source } },
      settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Collect errors/warnings
    const errors = (output.errors || []).filter((e: { severity: string }) => e.severity === "error");
    if (errors.length > 0) {
      return NextResponse.json({
        error: errors.map((e: { formattedMessage: string }) => e.formattedMessage).join("\n"),
      });
    }

    // Find the first contract in output
    const fileContracts = output.contracts?.["contract.sol"];
    if (!fileContracts || Object.keys(fileContracts).length === 0) {
      return NextResponse.json({ error: "No contracts found in source" });
    }

    const contracts = Object.entries(fileContracts).map(([name, data]: [string, unknown]) => {
      const c = data as { abi: unknown[]; evm: { bytecode: { object: string } } };
      return {
        name,
        abi: c.abi,
        bytecode: ("0x" + c.evm.bytecode.object) as `0x${string}`,
      };
    });

    return NextResponse.json({ contracts });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
