import { useMemo } from "react";
import { useAccount, useCapabilities } from "wagmi";

export function useWalletCapabilities() {
  const { chainId } = useAccount();
  const { data: capabilities } = useCapabilities();

  const supportsBatching = useMemo(() => {
    if (!chainId) return false;
    const atomic = capabilities?.[chainId]?.atomic;
    return atomic?.status === "ready" || atomic?.status === "supported";
  }, [capabilities, chainId]);

  const supportsPaymaster = useMemo(() => {
    if (!chainId) return false;
    return capabilities?.[chainId]?.paymasterService?.supported === true;
  }, [capabilities, chainId]);

  return { supportsBatching, supportsPaymaster };
}
