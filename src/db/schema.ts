import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  doublePrecision,
  date,
  uniqueIndex,
  primaryKey,
  pgEnum,
  index,
  pgMaterializedView
} from "drizzle-orm/pg-core";
import { sql, eq, relations } from "drizzle-orm";

// Enums
export const denominationEnum = pgEnum("denomination", [
  "catholic",
  "protestant",
  "orthodox",
  "other",
  "ecumenical"
]);

export const architecturalStyleEnum = pgEnum("architectural_style", [
  "gothic",
  "romanesque",
  "baroque",
  "neoclassical",
  "modern",
  "brutalist",
  "byzantine",
  "renaissance",
  "art_nouveau",
  "other"
]);

export const heritageStatusEnum = pgEnum("heritage_status", [
  "unesco",
  "national",
  "local",
  "none"
]);

// Tables
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => authUsers.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  displayNameIdx: index("profiles_display_name_idx").on(table.displayName)
}));

// Reference to auth.users (managed by Supabase)
export const authUsers = pgTable("users", {
  id: uuid("id").primaryKey()
}, (table) => ({
  // This table exists in auth schema; we reference it for FK
}));

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  inviteCode: text("invite_code").unique().notNull(),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  inviteCodeIdx: uniqueIndex("groups_invite_code_idx").on(table.inviteCode),
  createdByIdx: index("groups_created_by_idx").on(table.createdBy)
}));

export const groupMembers = pgTable("group_members", {
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.groupId, table.userId] }),
  userIdIdx: index("group_members_user_id_idx").on(table.userId)
}));

export const churches = pgTable("churches", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  denomination: denominationEnum("denomination"),
  address: text("address"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  yearBuilt: integer("year_built"),
  architecturalStyle: architecturalStyleEnum("architectural_style"),
  website: text("website"),
  serviceTimes: text("service_times"),
  description: text("description"),
  patronSaint: text("patron_saint"),
  heritageStatus: heritageStatusEnum("heritage_status").default("none"),
  organBuilder: text("organ_builder"),
  organSpecs: text("organ_specs"),
  capacity: integer("capacity"),
  wheelchairAccessible: boolean("wheelchair_accessible"),
  parkingInfo: text("parking_info"),
  virtualTourUrl: text("virtual_tour_url"),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  groupIdIdx: index("churches_group_id_idx").on(table.groupId),
  createdByIdx: index("churches_created_by_idx").on(table.createdBy),
  latLngIdx: index("churches_lat_lng_idx").on(table.lat, table.lng),
  nameSearchIdx: index("churches_name_search_idx").on(table.name)
}));

export const ratings = pgTable("ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  churchId: uuid("church_id").references(() => churches.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  exterior: integer("exterior").notNull(),
  interior: integer("interior").notNull(),
  surroundings: integer("surroundings").notNull(),
  acoustics: integer("acoustics").notNull(),
  hasOrgan: boolean("has_organ").default(false).notNull(),
  organRating: integer("organ_rating"),
  vibe: integer("vibe").notNull(),
  visitDate: date("visit_date"),
  timeSpentMinutes: integer("time_spent_minutes"),
  companionsReason: text("companions_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  churchUserUnique: uniqueIndex("ratings_church_user_unique").on(table.churchId, table.userId),
  churchIdIdx: index("ratings_church_id_idx").on(table.churchId),
  userIdIdx: index("ratings_user_id_idx").on(table.userId)
}));

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  churchId: uuid("church_id").references(() => churches.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  storagePath: text("storage_path").notNull(),
  mimeType: text("mime_type").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  churchIdIdx: index("media_church_id_idx").on(table.churchId),
  userIdIdx: index("media_user_id_idx").on(table.userId)
}));

// Materialized view for aggregates
export const churchAggregates = pgMaterializedView("church_aggregates").as((qb) =>
  qb
    .select({
      churchId: churches.id,
      ratingCount: sql<number>`COUNT(${ratings.id})`.as("rating_count"),
      avgExterior: sql<number>`ROUND(AVG(${ratings.exterior})::numeric, 2)`.as("avg_exterior"),
      avgInterior: sql<number>`ROUND(AVG(${ratings.interior})::numeric, 2)`.as("avg_interior"),
      avgSurroundings: sql<number>`ROUND(AVG(${ratings.surroundings})::numeric, 2)`.as("avg_surroundings"),
      avgAcoustics: sql<number>`ROUND(AVG(${ratings.acoustics})::numeric, 2)`.as("avg_acoustics"),
      avgOrgan: sql<number>`ROUND(AVG(${ratings.organRating}) FILTER (WHERE ${ratings.hasOrgan})::numeric, 2)`.as("avg_organ"),
      avgVibe: sql<number>`ROUND(AVG(${ratings.vibe})::numeric, 2)`.as("avg_vibe"),
      overallScore: sql<number>`ROUND((
        AVG(${ratings.exterior}) + AVG(${ratings.interior}) + AVG(${ratings.surroundings}) +
        AVG(${ratings.acoustics}) + AVG(${ratings.vibe}) +
        AVG(${ratings.organRating}) FILTER (WHERE ${ratings.hasOrgan})
      ) / (5 + COUNT(${ratings.organRating}) FILTER (WHERE ${ratings.hasOrgan}))::numeric, 2)`.as("overall_score")
    })
    .from(churches)
    .leftJoin(ratings, eq(ratings.churchId, churches.id))
    .groupBy(churches.id)
);

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  groupsCreated: many(groups, { relationName: "creator" }),
  groupMemberships: many(groupMembers),
  churchesCreated: many(churches),
  ratings: many(ratings),
  media: many(media)
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(profiles, { fields: [groups.createdBy], references: [profiles.id], relationName: "creator" }),
  members: many(groupMembers),
  churches: many(churches)
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(profiles, { fields: [groupMembers.userId], references: [profiles.id] })
}));

export const churchesRelations = relations(churches, ({ one, many }) => ({
  creator: one(profiles, { fields: [churches.createdBy], references: [profiles.id] }),
  group: one(groups, { fields: [churches.groupId], references: [groups.id] }),
  ratings: many(ratings),
  media: many(media)
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  church: one(churches, { fields: [ratings.churchId], references: [churches.id] }),
  user: one(profiles, { fields: [ratings.userId], references: [profiles.id] })
}));

export const mediaRelations = relations(media, ({ one }) => ({
  church: one(churches, { fields: [media.churchId], references: [churches.id] }),
  user: one(profiles, { fields: [media.userId], references: [profiles.id] })
}));

// Types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
export type Church = typeof churches.$inferSelect;
export type NewChurch = typeof churches.$inferInsert;
export type Rating = typeof ratings.$inferSelect;
export type NewRating = typeof ratings.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type ChurchAggregate = {
  churchId: string;
  ratingCount: number;
  avgExterior: number;
  avgInterior: number;
  avgSurroundings: number;
  avgAcoustics: number;
  avgOrgan: number;
  avgVibe: number;
  overallScore: number;
};