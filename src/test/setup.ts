import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock thirdweb client
vi.mock('@/lib/thirdweb', () => ({
  thirdwebClient: {
    clientId: 'test-client-id',
  },
}));

// Mock environment variables
vi.stubEnv('THIRDWEB_CLIENT_ID', 'test-client-id');
vi.stubEnv('NEXT_PUBLIC_THIRDWEB_CLIENT_ID', 'test-client-id');
