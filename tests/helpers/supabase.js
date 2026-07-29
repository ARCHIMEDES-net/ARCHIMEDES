import { vi } from "vitest";

export function createSupabaseMock({
  user = null,
  userError = null,
  tableResults = {},
  rpcResult = { data: true, error: null },
} = {}) {
  const queries = [];

  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user },
        error: userError,
      })),
    },
    from: vi.fn((table) => {
      const query = {
        table,
        filters: {},
      };
      queries.push(query);

      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn((field, value) => {
          query.filters[field] = value;
          return builder;
        }),
        maybeSingle: vi.fn(async () => {
          const configured = tableResults[table];
          const result = typeof configured === "function"
            ? configured(query, queries)
            : configured;

          return result || { data: null, error: null };
        }),
      };

      return builder;
    }),
    rpc: vi.fn(async () => rpcResult),
  };

  return { supabase, queries };
}
