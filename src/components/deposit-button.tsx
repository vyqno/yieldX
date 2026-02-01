"use client";

import { useState } from "react";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { thirdwebClient } from "@/lib/thirdweb";
import {
  prepareApproveTransaction,
  prepareSupplyTransaction,
  parseTokenAmount,
} from "@/lib/aave-deposit";
import { getChainConfig, type SupportedChainId } from "@/lib/chains-config";

interface DepositButtonProps {
  tokenSymbol: string;
  amount: string;
  chainId: SupportedChainId;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function DepositButton({
  tokenSymbol,
  amount,
  chainId,
  onSuccess,
  onError,
}: DepositButtonProps) {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [status, setStatus] = useState<string>("");
  const [step, setStep] = useState<number>(0);

  const handleDeposit = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const config = getChainConfig(chainId);
      const tokenAddress = config.tokens[tokenSymbol as keyof typeof config.tokens];
      const decimals = tokenSymbol === "USDC" || tokenSymbol === "USDT" ? 6 : 18;
      const amountInWei = parseTokenAmount(amount, decimals);

      // Step 1: Approve
      setStep(1);
      setStatus(`Approving ${tokenSymbol}...`);

      const approveTx = prepareApproveTransaction(
        thirdwebClient,
        tokenAddress,
        amountInWei,
        chainId
      );

      await new Promise<void>((resolve, reject) => {
        sendTransaction(approveTx, {
          onSuccess: () => {
            console.log("✅ Approval successful");
            resolve();
          },
          onError: (error) => {
            console.error("❌ Approval failed:", error);
            reject(error);
          },
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 2: Supply to Aave
      setStep(2);
      setStatus(`Depositing ${amount} ${tokenSymbol} to Aave...`);

      const supplyTx = prepareSupplyTransaction(
        thirdwebClient,
        tokenAddress,
        amountInWei,
        account.address,
        chainId
      );

      await new Promise<void>((resolve, reject) => {
        sendTransaction(supplyTx, {
          onSuccess: () => {
            console.log("✅ Deposit successful");
            setStep(3);
            setStatus(`Success! You're now earning interest on ${amount} ${tokenSymbol}`);
            resolve();
            onSuccess?.();
          },
          onError: (error) => {
            console.error("❌ Deposit failed:", error);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : "Transaction failed"}`);
      setStep(0);
      onError?.(error as Error);
    }
  };

  if (!account) {
    return (
      <button className="w-full px-6 py-3 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-xl cursor-not-allowed border border-[var(--border)] font-medium" disabled>
        Connect Wallet First
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDeposit}
        disabled={isPending || step > 0}
        className={`w-full px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
          isPending || step > 0
            ? "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed border border-[var(--border)]"
            : "bg-gradient-to-r from-[var(--brand-lavender-deep)] to-[var(--brand-lavender)] text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {step === 0 && `Deposit ${amount} ${tokenSymbol}`}
        {step === 1 && "Approving..."}
        {step === 2 && "Depositing..."}
        {step === 3 && "✅ Deposited!"}
      </button>

      {status && <p className="text-sm text-center text-muted-foreground animate-pulse">{status}</p>}

      {step === 3 && (
        <div className="mt-4 p-4 bg-[var(--accent-mint)]/30 border border-[var(--risk-low)] rounded-xl backdrop-blur-md">
          <p className="text-green-800 dark:text-green-300 font-semibold flex items-center gap-2">
            🎉 Success! Your {tokenSymbol} is now earning interest on Aave!
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">
            You'll receive aTokens (a{tokenSymbol}) in your wallet. These automatically increase in value as you earn interest.
          </p>
        </div>
      )}
    </div>
  );
}
