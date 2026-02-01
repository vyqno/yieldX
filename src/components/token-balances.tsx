"use client";

import { useActiveAccount } from "thirdweb/react";
import { getWalletBalance } from "thirdweb/wallets";
import { ethereum } from "thirdweb/chains";
import { useEffect, useState } from "react";
import { thirdwebClient } from "@/lib/thirdweb";
import { TOKEN_LIST } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  icon: string;
  type: string;
}

export function TokenBalances() {
  const account = useActiveAccount();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBalances() {
      if (!account) {
        setBalances([]);
        setEthBalance("0");
        return;
      }

      setLoading(true);
      try {
        // Fetch ETH balance
        const nativeBalance = await getWalletBalance({
          address: account.address,
          client: thirdwebClient,
          chain: ethereum,
        });
        setEthBalance(
          Number(nativeBalance.displayValue).toFixed(4)
        );

        // Fetch token balances for our tracked stablecoins
        const tokenBalances: TokenBalance[] = [];

        for (const token of TOKEN_LIST) {
          try {
            const balance = await getWalletBalance({
              address: account.address,
              client: thirdwebClient,
              chain: ethereum,
              tokenAddress: token.address,
            });

            tokenBalances.push({
              symbol: token.symbol,
              name: token.name,
              balance: Number(balance.displayValue).toFixed(2),
              icon: token.icon,
              type: token.type,
            });
          } catch {
            // Token not found or error, show 0 balance
            tokenBalances.push({
              symbol: token.symbol,
              name: token.name,
              balance: "0.00",
              icon: token.icon,
              type: token.type,
            });
          }
        }

        setBalances(tokenBalances);
      } catch (error) {
        console.error("Error fetching balances:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, [account]);

  if (!account) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Your Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view your token balances.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          Your Assets
          {loading && <span className="text-xs text-muted-foreground">(Loading...)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* ETH Balance Header */}
        <div className="mb-4 p-4 bg-secondary/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⟠</span>
              <div>
                <p className="font-medium">Ethereum</p>
                <p className="text-xs text-muted-foreground">Native Token</p>
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-lg font-semibold">{ethBalance} ETH</p>
            )}
          </div>
        </div>

        {/* Token Balances Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? TOKEN_LIST.map((token) => (
                  <TableRow key={token.symbol}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : balances.map((token) => (
                  <TableRow key={token.symbol}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {token.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {token.balance}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
