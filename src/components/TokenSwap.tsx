"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { encodeFunctionData, formatUnits, parseUnits } from "viem";
import toast from "react-hot-toast";
import {
  ERC20_ABI,
  QUOTER_V2,
  QUOTER_V2_ABI,
  SWAP_ROUTER_02,
  SWAP_ROUTER_02_ABI,
  TOKENS,
  getPoolFee,
} from "@/lib/swapConfig";
import { txUrl } from "@/lib/explorer";
import { useDebounce } from "@/hooks/useDebounce";

const SLIPPAGE_BPS = BigInt(50); // 0.5%
const ZERO = BigInt(0);
const BPS_DENOM = BigInt(10000);

export function TokenSwap() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();

  const [tokenInSym, setTokenInSym] = useState("ETH");
  const [tokenOutSym, setTokenOutSym] = useState("USDC");
  const [amountIn, setAmountIn] = useState("0.001");
  const [quote, setQuote] = useState<bigint | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [allowance, setAllowance] = useState<bigint | null>(null);

  const tokenIn = useMemo(() => TOKENS.find((t) => t.symbol === tokenInSym)!, [tokenInSym]);
  const tokenOut = useMemo(() => TOKENS.find((t) => t.symbol === tokenOutSym)!, [tokenOutSym]);
  const fee = useMemo(() => getPoolFee(tokenIn, tokenOut), [tokenIn, tokenOut]);

  const debouncedAmount = useDebounce(amountIn, 350);

  const parsedAmount = useMemo(() => {
    try {
      if (!debouncedAmount || Number(debouncedAmount) <= 0) return ZERO;
      return parseUnits(debouncedAmount, tokenIn.decimals);
    } catch {
      return ZERO;
    }
  }, [debouncedAmount, tokenIn.decimals]);

  // Native ETH balance OR ERC20 balance
  const { data: balance } = useBalance({
    address,
    token: tokenIn.isNative ? undefined : tokenIn.address,
    chainId: base.id,
  });

  // Quote
  useEffect(() => {
    if (!publicClient || !fee || parsedAmount === ZERO) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    publicClient
      .simulateContract({
        address: QUOTER_V2,
        abi: QUOTER_V2_ABI,
        functionName: "quoteExactInputSingle",
        args: [{
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amountIn: parsedAmount,
          fee,
          sqrtPriceLimitX96: ZERO,
        }],
      })
      .then((res) => {
        if (cancelled) return;
        const [amountOut] = res.result as readonly [bigint, bigint, number, bigint];
        setQuote(amountOut);
      })
      .catch(() => { if (!cancelled) setQuote(null); })
      .finally(() => { if (!cancelled) setQuoting(false); });
    return () => { cancelled = true; };
  }, [publicClient, fee, parsedAmount, tokenIn.address, tokenOut.address]);

  // Allowance (only meaningful for ERC20 input)
  const refreshAllowance = useCallback(async () => {
    if (!publicClient || !address || tokenIn.isNative) {
      setAllowance(null);
      return;
    }
    const a = await publicClient.readContract({
      address: tokenIn.address,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [address, SWAP_ROUTER_02],
    });
    setAllowance(a as bigint);
  }, [publicClient, address, tokenIn]);

  useEffect(() => { refreshAllowance(); }, [refreshAllowance]);

  // Approve
  const { writeContract: approve, data: approveTxHash, isPending: isApproving } = useWriteContract();
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });
  useEffect(() => {
    if (approveSuccess) {
      toast.success("Approved");
      refreshAllowance();
    }
  }, [approveSuccess, refreshAllowance]);

  // Swap
  const { writeContract: swap, data: swapTxHash, isPending: isSwapping } = useWriteContract();
  const { isSuccess: swapSuccess } = useWaitForTransactionReceipt({ hash: swapTxHash });
  useEffect(() => { if (swapSuccess) toast.success("Swap confirmed!"); }, [swapSuccess]);

  function flip() {
    setTokenInSym(tokenOutSym);
    setTokenOutSym(tokenInSym);
    setAmountIn("");
    setQuote(null);
  }

  function handleApprove() {
    if (tokenIn.isNative || parsedAmount === ZERO) return;
    approve(
      { address: tokenIn.address, abi: ERC20_ABI, functionName: "approve", args: [SWAP_ROUTER_02, parsedAmount] },
      { onError: (e) => toast.error(e.message?.split("\n")[0] || "Approve failed") }
    );
  }

  function handleSwap() {
    if (!address || !fee || parsedAmount === ZERO || quote === null) return;
    const amountOutMinimum = quote - (quote * SLIPPAGE_BPS) / BPS_DENOM;

    const params = {
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      fee,
      recipient: tokenOut.isNative ? SWAP_ROUTER_02 : address,
      amountIn: parsedAmount,
      amountOutMinimum,
      sqrtPriceLimitX96: ZERO,
    } as const;

    if (tokenOut.isNative) {
      // Token -> ETH: route to router then unwrap WETH9 to user
      const exactInputCall = encodeFunctionData({
        abi: SWAP_ROUTER_02_ABI,
        functionName: "exactInputSingle",
        args: [params],
      });
      const unwrapCall = encodeFunctionData({
        abi: SWAP_ROUTER_02_ABI,
        functionName: "unwrapWETH9",
        args: [amountOutMinimum, address],
      });
      swap(
        {
          address: SWAP_ROUTER_02,
          abi: SWAP_ROUTER_02_ABI,
          functionName: "multicall",
          args: [[exactInputCall, unwrapCall]],
        },
        { onError: (e) => toast.error(e.message?.split("\n")[0] || "Swap failed") }
      );
    } else {
      // ETH -> Token: pass msg.value; SwapRouter02 wraps internally.
      // Token -> Token: standard exactInputSingle, no value.
      swap(
        {
          address: SWAP_ROUTER_02,
          abi: SWAP_ROUTER_02_ABI,
          functionName: "exactInputSingle",
          args: [params],
          value: tokenIn.isNative ? parsedAmount : ZERO,
        },
        { onError: (e) => toast.error(e.message?.split("\n")[0] || "Swap failed") }
      );
    }
  }

  if (!address) return null;

  const onWrongNetwork = chainId !== base.id;
  const sameToken = tokenIn.symbol === tokenOut.symbol;
  const insufficientBalance =
    balance !== undefined && parsedAmount > ZERO && parsedAmount > balance.value;
  const needsApproval =
    !tokenIn.isNative && allowance !== null && allowance < parsedAmount && parsedAmount > ZERO;

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg">🔁</div>
        <div>
          <h2 className="text-lg font-semibold">Swap Tokens</h2>
          <p className="text-sm text-gray-400">Uniswap V3 on Base mainnet · 0.5% slippage</p>
        </div>
      </div>

      {onWrongNetwork && (
        <div className="text-xs bg-yellow-950/40 border border-yellow-700/40 text-yellow-300 rounded-lg px-3 py-2">
          Switch your wallet to Base mainnet to swap.
        </div>
      )}

      {/* From */}
      <div className="bg-[#1a1a1a] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>From</span>
          {balance !== undefined && (
            <button
              onClick={() => setAmountIn(formatUnits(balance.value, tokenIn.decimals))}
              className="hover:text-blue-400"
            >
              Balance: {Number(formatUnits(balance.value, tokenIn.decimals)).toFixed(6)} (max)
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input
            style={{ background: "#fff", color: "#000", border: "1px solid #555", borderRadius: "8px", padding: "8px 12px", flex: 1, fontSize: "14px", boxSizing: "border-box" }}
            type="number"
            min="0"
            step="any"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
          />
          <select
            value={tokenInSym}
            onChange={(e) => setTokenInSym(e.target.value)}
            className="bg-[#222] border border-[#444] rounded-lg px-3 py-2 text-sm font-semibold"
          >
            {TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={flip}
          className="bg-[#222] hover:bg-[#2a2a2a] border border-[#333] rounded-full w-8 h-8 flex items-center justify-center text-sm"
          aria-label="Flip swap direction"
        >
          ↓
        </button>
      </div>

      {/* To */}
      <div className="bg-[#1a1a1a] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>To (estimated)</span>
        </div>
        <div className="flex gap-2">
          <input
            style={{ background: "#fff", color: "#000", border: "1px solid #555", borderRadius: "8px", padding: "8px 12px", flex: 1, fontSize: "14px", boxSizing: "border-box" }}
            type="text"
            readOnly
            value={
              quoting ? "…" :
              quote !== null ? Number(formatUnits(quote, tokenOut.decimals)).toFixed(6) : ""
            }
            placeholder="0.0"
          />
          <select
            value={tokenOutSym}
            onChange={(e) => setTokenOutSym(e.target.value)}
            className="bg-[#222] border border-[#444] rounded-lg px-3 py-2 text-sm font-semibold"
          >
            {TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status messages */}
      {sameToken && (
        <p className="text-xs text-yellow-400">Pick two different tokens.</p>
      )}
      {!sameToken && fee === null && (
        <p className="text-xs text-yellow-400">No configured pool for this pair.</p>
      )}
      {!sameToken && fee !== null && parsedAmount > ZERO && quote === null && !quoting && (
        <p className="text-xs text-yellow-400">No liquidity / quote failed.</p>
      )}

      {/* Action buttons */}
      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={isApproving || onWrongNetwork || insufficientBalance}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 font-semibold text-sm transition"
        >
          {isApproving ? "Approving…" : `Approve ${tokenIn.symbol}`}
        </button>
      ) : (
        <button
          onClick={handleSwap}
          disabled={
            isSwapping || onWrongNetwork || sameToken || fee === null ||
            parsedAmount === ZERO || quote === null || insufficientBalance
          }
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 font-semibold text-sm transition"
        >
          {insufficientBalance ? "Insufficient balance" :
           isSwapping ? "Swapping…" :
           `Swap ${tokenIn.symbol} → ${tokenOut.symbol}`}
        </button>
      )}

      {(approveTxHash || swapTxHash) && (
        <a
          href={txUrl(chainId, swapTxHash ?? approveTxHash!)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:underline font-mono block truncate"
        >
          tx: {swapTxHash ?? approveTxHash}
        </a>
      )}
    </div>
  );
}
