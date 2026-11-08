import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
};

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: "date" }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    ...timestamps,
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const recordPermission = pgTable("record_permission", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  canView: boolean("can_view").notNull(),
  canDelete: boolean("can_delete").notNull(),
  canCurate: boolean("can_curate").notNull().default(true),
});

export const record = pgTable(
  "record",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: text("status").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    reason: text("reason"),
    ...timestamps,
  },
  (table) => [index("record_user_id_idx").on(table.userId)],
);

export const workbenchSettings = pgTable("workbench_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  pageSize: integer("page_size").notNull(),
});

export const activityEvent = pgTable(
  "activity_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recordId: uuid("record_id"),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("activity_event_user_created_idx").on(table.userId, table.createdAt)],
);

export const job = pgTable(
  "job",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    outcome: text("outcome").notNull(),
    status: text("status").notNull(),
    progress: integer("progress").notNull(),
    attempt: integer("attempt").notNull(),
    replacesJobId: uuid("replaces_job_id"),
    retriedByJobId: uuid("retried_by_job_id"),
    ...timestamps,
  },
  (table) => [index("job_user_id_idx").on(table.userId)],
);

export const observation = pgTable(
  "observation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recordId: uuid("record_id").references(() => record.id, { onDelete: "set null" }),
    fixtureKey: text("fixture_key"),
    category: text("category").notNull(),
    status: text("status").notNull(),
    value: integer("value").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("observation_user_observed_idx").on(table.userId, table.observedAt),
    index("observation_user_fixture_idx").on(table.userId, table.fixtureKey),
  ],
);

export const tag = pgTable(
  "tag",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (table) => [index("tag_user_name_idx").on(table.userId, table.name)],
);

export const recordTag = pgTable(
  "record_tag",
  {
    recordId: uuid("record_id")
      .notNull()
      .references(() => record.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("record_tag_record_idx").on(table.recordId)],
);

export const collection = pgTable(
  "collection",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    ...timestamps,
  },
  (table) => [index("collection_user_idx").on(table.userId)],
);

export const membership = pgTable(
  "membership",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
    recordId: uuid("record_id")
      .notNull()
      .references(() => record.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rationale: text("rationale"),
    ...timestamps,
  },
  (table) => [index("membership_collection_idx").on(table.collectionId)],
);

export const savedView = pgTable(
  "saved_view",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    query: text("query").notNull(),
    ...timestamps,
  },
  (table) => [index("saved_view_user_idx").on(table.userId)],
);

export const note = pgTable(
  "note",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    ...timestamps,
  },
  (table) => [index("note_user_id_idx").on(table.userId)],
);
