"use client";

import { useState } from "react";
import { CHAIN_NAMES, CHAIN_WARNINGS, FAUCET_LINKS, type SupportedChainId } from "@/lib/chains-config";

interface ChainSelectorProps {
  selectedChain: SupportedChainId;
  onChainChange: (chain: SupportedChainId) => void;
}

export function ChainSelector({ selectedChain, onChainChange }: ChainSelectorProps) {
  const isTestnet = selectedChain === 'sepolia' || selectedChain === 'baseSepolia';

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select Network:</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => onChainChange('base')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedChain === 'base'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {CHAIN_NAMES.base}
        </button>
        <button
          onClick={() => onChainChange('baseSepolia')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedChain === 'baseSepolia'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {CHAIN_NAMES.baseSepolia}
        </button>
        <button
          onClick={() => onChainChange('mainnet')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedChain === 'mainnet'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {CHAIN_NAMES.mainnet}
        </button>
        <button
          onClick={() => onChainChange('sepolia')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedChain === 'sepolia'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {CHAIN_NAMES.sepolia}
        </button>
      </div>

      {/* Warning badge */}
      <div className={`px-3 py-2 rounded-lg text-sm ${
        selectedChain === 'mainnet'
          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
      }`}>
        {CHAIN_WARNINGS[selectedChain]}
      </div>

      {/* Faucet links for Testnets */}
      {isTestnet && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            Need test tokens?
          </p>
          <div className="flex gap-2 flex-wrap">
            <a
              href={selectedChain === 'sepolia' ? FAUCET_LINKS.sepolia.eth : FAUCET_LINKS.baseSepolia.eth}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Get {selectedChain === 'sepolia' ? 'Sepolia' : 'Base Sepolia'} ETH
            </a>
            <a
              href={selectedChain === 'sepolia' ? FAUCET_LINKS.sepolia.aave : FAUCET_LINKS.baseSepolia.aave}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Get Test Tokens (Aave)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
