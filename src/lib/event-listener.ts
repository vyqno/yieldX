/**
 * Event-Driven Aave Data Listener
 * 
 * Listens to Aave V3 Pool contract events (Supply, Borrow, Repay, Withdraw)
 * and triggers data refresh ONLY when on-chain state changes.
 * 
 * This is the optimal approach - no wasted RPC calls!
 */

import { getContract, watchContractEvents } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { thirdwebClient } from "./thirdweb";
import { AAVE_V3_POOL_ADDRESS, TOKENS } from "./constants";

// Aave V3 Pool ABI - Events only
const AAVE_POOL_EVENTS_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "reserve", type: "address" },
      { indexed: false, name: "user", type: "address" },
      { indexed: true, name: "onBehalfOf", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: true, name: "referralCode", type: "uint16" },
    ],
    name: "Supply",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "reserve", type: "address" },
      { indexed: false, name: "user", type: "address" },
      { indexed: true, name: "onBehalfOf", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "interestRateMode", type: "uint8" },
      { indexed: false, name: "borrowRate", type: "uint256" },
      { indexed: true, name: "referralCode", type: "uint16" },
    ],
    name: "Borrow",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "reserve", type: "address" },
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "repayer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "useATokens", type: "bool" },
    ],
    name: "Repay",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "reserve", type: "address" },
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "reserve", type: "address" },
      { indexed: false, name: "liquidityRate", type: "uint256" },
      { indexed: false, name: "stableBorrowRate", type: "uint256" },
      { indexed: false, name: "variableBorrowRate", type: "uint256" },
      { indexed: false, name: "liquidityIndex", type: "uint256" },
      { indexed: false, name: "variableBorrowIndex", type: "uint256" },
    ],
    name: "ReserveDataUpdated",
    type: "event",
  },
] as const;

// Get our tracked token addresses as lowercase for comparison
const TRACKED_ASSETS = Object.values(TOKENS).map((t) =>
  t.address.toLowerCase()
);

export interface AaveEvent {
  eventName: string;
  reserve: string;
  timestamp: Date;
  blockNumber: bigint;
  transactionHash: string;
}

export type EventCallback = (event: AaveEvent) => void;

/**
 * Start listening to Aave Pool events for our tracked assets
 * Returns an unsubscribe function
 */
export function listenToAaveEvents(onEvent: EventCallback): () => void {
  const contract = getContract({
    client: thirdwebClient,
    chain: ethereum,
    address: AAVE_V3_POOL_ADDRESS,
    abi: AAVE_POOL_EVENTS_ABI,
  });

  // Watch ReserveDataUpdated - this is the key event that tells us when rates change
  const unwatch = watchContractEvents({
    contract,
    onEvents: (events) => {
      for (const event of events) {
        // Check if this event is for one of our tracked assets
        const reserve = (event.args as { reserve?: string })?.reserve;
        if (reserve && TRACKED_ASSETS.includes(reserve.toLowerCase())) {
          onEvent({
            eventName: event.eventName,
            reserve: reserve,
            timestamp: new Date(),
            blockNumber: event.blockNumber ?? BigInt(0),
            transactionHash: event.transactionHash ?? "",
          });
        }
      }
    },
  });

  console.log("[AaveListener] Started listening to Aave V3 Pool events");
  console.log("[AaveListener] Tracking assets:", TRACKED_ASSETS);

  return () => {
    unwatch();
    console.log("[AaveListener] Stopped listening");
  };
}

/**
 * Check if an asset is one we're tracking
 */
export function isTrackedAsset(address: string): boolean {
  return TRACKED_ASSETS.includes(address.toLowerCase());
}
