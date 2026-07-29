import { vi } from "vitest";

export function createSupabaseMock({
  user = null,
  userError = null,
  createUserResult = { data: { user: null }, error: null },
  generateLinkResult = { data: null, error: null },
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
      admin: {
        createUser: vi.fn(async () => createUserResult),
        generateLink: vi.fn(async () => generateLinkResult),
        deleteUser: vi.fn(async () => ({ data: null, error: null })),
      },
    },
    from: vi.fn((table) => {
      const query = {
        table,
        filters: {},
        orFilters: [],
        orderBy: [],
        mutation: null,
      };
      queries.push(query);

      const resolveResult = () => {
        const configured = tableResults[table];
        const result = typeof configured === "function"
          ? configured(query, queries)
          : configured;

        return result || { data: null, error: null };
      };

      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn((field, value) => {
          query.filters[field] = value;
          return builder;
        }),
        ilike: vi.fn((field, value) => {
          query.filters[field] = value;
          return builder;
        }),
        in: vi.fn((field, value) => {
          query.filters[field] = value;
          return builder;
        }),
        or: vi.fn((value) => {
          query.orFilters.push(value);
          return builder;
        }),
        order: vi.fn((field, options) => {
          query.orderBy.push({ field, options });
          return builder;
        }),
        update: vi.fn((value) => {
          query.mutation = { type: "update", value };
          return builder;
        }),
        upsert: vi.fn((value, options) => {
          query.mutation = { type: "upsert", value, options };
          return builder;
        }),
        limit: vi.fn(async () => resolveResult()),
        maybeSingle: vi.fn(async () => resolveResult()),
        then(resolve, reject) {
          return Promise.resolve(resolveResult()).then(resolve, reject);
        },
      };

      return builder;
    }),
    rpc: vi.fn(async () => rpcResult),
  };

  return { supabase, queries };
}
