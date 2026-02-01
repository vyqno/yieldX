"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { thirdwebClient } from "@/lib/thirdweb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChainConfig, type SupportedChainId } from "@/lib/chains-config";

interface WalletConnectProps {
  chainId?: SupportedChainId;
}

export function WalletConnect({ chainId = 'sepolia' }: WalletConnectProps) {
  const account = useActiveAccount();
  const config = getChainConfig(chainId);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <ConnectButton
            client={thirdwebClient}
            chain={config.chain}
            chains={[config.chain]}
            switchButton={{
              label: "Switch Network",
              className:
                "!bg-orange-600 !text-white !rounded-lg !px-4 !py-2 !font-medium hover:!bg-orange-700 transition-colors",
            }}
            connectButton={{
              label: "Connect Wallet",
              className:
                "!bg-primary !text-primary-foreground !rounded-lg !px-4 !py-2 !font-medium hover:!bg-primary/90 transition-colors",
            }}
            detailsButton={{
              className:
                "!bg-secondary !text-secondary-foreground !rounded-lg !px-4 !py-2",
            }}
          />
          {account && (
            <p className="text-sm text-muted-foreground">
              Connected:{" "}
              <span className="font-mono">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
