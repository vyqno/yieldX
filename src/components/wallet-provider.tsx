"use client";

import { ConnectButton } from "thirdweb/react";
import { thirdwebClient } from "@/lib/thirdweb";
import { mainnet } from "thirdweb/chains";

export function WalletConnectButton() {
  return (
    <ConnectButton
      client={thirdwebClient}
      chain={mainnet}
      connectButton={{
        label: "Connect Wallet",
        className:
          "!bg-[var(--brand-lavender-deep)] !text-white !rounded-full !px-5 !py-2.5 !font-medium !text-sm hover:!bg-[var(--brand-lavender)] !transition-all !shadow-lg hover:!shadow-[var(--glow-lavender)] !border-none",
        style: {
          backgroundColor: "var(--brand-lavender-deep)",
          color: "white",
          borderRadius: "9999px",
        },
      }}
      detailsButton={{
        className:
          "!bg-[var(--glass-bg)] !backdrop-blur-[var(--glass-blur)] !border !border-[var(--glass-border)] !text-foreground !rounded-full !px-4 !py-2 !font-medium !text-sm hover:!bg-[var(--glass-bg-hover)] !transition-all",
      }}
    />
  );
}
