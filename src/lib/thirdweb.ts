import { createThirdwebClient } from "thirdweb";

// Create the thirdweb client
// Get your client ID from https://thirdweb.com/dashboard/settings/api-keys
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  throw new Error(
    "Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID. Please add it to your .env.local file."
  );
}

export const thirdwebClient = createThirdwebClient({
  clientId,
});
