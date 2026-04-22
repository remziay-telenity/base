import artifact from "./counterArtifact.json";

export const COUNTER_BYTECODE = artifact.bytecode as `0x${string}`;
export const COUNTER_ABI = artifact.abi as readonly {
  inputs: readonly { internalType: string; name: string; type: string }[];
  name: string;
  outputs: readonly { internalType: string; name: string; type: string }[];
  stateMutability: string;
  type: string;
}[];
