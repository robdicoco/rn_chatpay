import type { ExecuteResult } from "@cosmjs/cosmwasm-stargate";

type ExecuteResultOrUndefined = ExecuteResult | undefined;
type QueryResult = {
  users?: string[];
  value?: string;
  map?: Array<[string, string]>;
};

// Add retry utility function
const connectUtilsSleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${i + 1} failed:`, error);
      if (i < maxRetries - 1) {
        await connectUtilsSleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
};


export { retryOperation, type ExecuteResultOrUndefined,  type QueryResult   };