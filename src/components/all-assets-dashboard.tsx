"use client";

/**
 * All Assets Dashboard
 * 
 * Displays ALL Aave V3 Ethereum assets with:
 * - Dynamic fetching from contract (no hardcoding)
 * - Category filters (Stablecoins, LSTs, BTC, Governance)
 * - Sorting by APY
 * - Event-driven updates
 * 
 * This is the DeFi Llama competitor dashboard.
 */

import { useState } from "react";
import { useAllAssetsYields } from "@/hooks/use-all-assets-yields";
import type { AssetYieldData } from "@/lib/dynamic-fetcher";
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
import { Button } from "@/components/ui/button";

type CategoryFilter = "All" | "Stablecoin" | "ETH & LST" | "BTC" | "Governance" | "Other";

// Format APY percentage
function formatAPY(apy: number): string {
  if (apy < 0.01) return "<0.01%";
  return `${apy.toFixed(2)}%`;
}

// Format utilization
function formatUtilization(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

// Category badge colors
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Stablecoin": "bg-green-600",
    "ETH & LST": "bg-blue-600",
    "BTC": "bg-orange-600",
    "Governance": "bg-purple-600",
    "Other": "bg-gray-600",
  };
  return colors[category] || "bg-gray-600";
}

export function AllAssetsDashboard() {
  const { 
    data: assets, 
    loading, 
    error, 
    lastFetched, 
    lastEvent,
    eventCount,
    assetCount,
    refetch 
  } = useAllAssetsYields();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [sortBy, setSortBy] = useState<"supplyAPY" | "borrowAPY" | "utilization">("supplyAPY");

  // Filter and sort assets
  const filteredAssets = assets
    .filter((asset) => categoryFilter === "All" || asset.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === "supplyAPY") return b.supplyAPY - a.supplyAPY;
      if (sortBy === "borrowAPY") return b.borrowAPY - a.borrowAPY;
      return b.utilizationRate - a.utilizationRate;
    });

  // Find best yield in filtered list
  const bestYield = filteredAssets.length > 0 ? filteredAssets[0] : null;

  // Category counts
  const categoryCounts = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Aave V3 All Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Error fetching data: {error.message}
          </p>
          <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg font-medium">
              Aave V3 All Assets
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {assetCount} assets • Direct from contract • Event-driven updates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-purple-600 text-xs">
              ⚡ Event-Driven
            </Badge>
            <Badge variant="outline" className="text-xs">
              {eventCount} events
            </Badge>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(["All", "Stablecoin", "ETH & LST", "BTC", "Governance", "Other"] as CategoryFilter[]).map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
              {cat !== "All" && categoryCounts[cat] && (
                <span className="ml-1 opacity-70">({categoryCounts[cat]})</span>
              )}
            </Button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          {(["supplyAPY", "borrowAPY", "utilization"] as const).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? "secondary" : "ghost"}
              size="sm"
              className="h-6 text-xs"
              onClick={() => setSortBy(sort)}
            >
              {sort === "supplyAPY" ? "Supply APY" : sort === "borrowAPY" ? "Borrow APY" : "Utilization"}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {/* Best Yield Highlight */}
        {!loading && bestYield && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Best {categoryFilter === "All" ? "Overall" : categoryFilter} Supply APY
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatAPY(bestYield.supplyAPY)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{bestYield.icon}</span>
                  <div>
                    <p className="font-semibold">{bestYield.symbol}</p>
                    <Badge className={`text-xs ${getCategoryColor(bestYield.category)}`}>
                      {bestYield.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assets Table */}
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[180px]">Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Supply APY</TableHead>
                <TableHead className="text-right">Borrow APY</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead className="text-right">Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && assets.length === 0
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-8 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-16 ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-16 ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-16 ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredAssets.map((asset, index) => {
                    const isBest = asset.symbol === bestYield?.symbol;
                    const lastUpdateTime = new Date(asset.lastUpdated * 1000);
                    
                    return (
                      <TableRow
                        key={asset.address}
                        className={isBest ? "bg-green-500/5" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{asset.icon}</span>
                            <div>
                              <p className="font-medium flex items-center gap-1">
                                {asset.symbol}
                                {isBest && (
                                  <Badge className="text-[10px] bg-green-500 hover:bg-green-500">
                                    #{index + 1}
                                  </Badge>
                                )}
                              </p>
                              {!asset.borrowingEnabled && (
                                <p className="text-[10px] text-muted-foreground">
                                  Supply only
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getCategoryColor(asset.category)}`}>
                            {asset.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                          {formatAPY(asset.supplyAPY)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-orange-600 dark:text-orange-400">
                          {asset.borrowingEnabled ? formatAPY(asset.borrowAPY) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {formatUtilization(asset.utilizationRate)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {lastUpdateTime.toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>

        {/* Footer Status */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>Listening to Aave Pool Events</span>
              </div>
              {lastEvent && (
                <span className="text-muted-foreground">
                  Last: {lastEvent.eventName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Fetched: {lastFetched?.toLocaleTimeString() || "—"}
              </span>
              <Button
                onClick={refetch}
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                disabled={loading}
              >
                {loading ? "Fetching..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
