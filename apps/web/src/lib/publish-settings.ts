import { getCollection } from "./mongodb";

export interface PublishSettings {
  /** When true, non-admin submissions wait for an admin before publishing. */
  requireApproval: boolean;
}

/**
 * New student submissions publish immediately by default. Admins can turn
 * approval back on from the dashboard without a deploy.
 */
export const DEFAULT_PUBLISH_SETTINGS: PublishSettings = {
  requireApproval: false,
};

const SETTINGS_ID = "publishing";

export async function getPublishSettings(): Promise<PublishSettings> {
  try {
    const col = await getCollection("settings");
    const doc = await col.findOne({ _id: SETTINGS_ID as any });
    return { requireApproval: doc?.requireApproval === true };
  } catch (error) {
    console.error("[publish-settings] read failed", error);
    return DEFAULT_PUBLISH_SETTINGS;
  }
}

export async function setPublishSettings(
  settings: PublishSettings
): Promise<PublishSettings> {
  const col = await getCollection("settings");
  const next = { requireApproval: Boolean(settings.requireApproval) };

  await col.updateOne(
    { _id: SETTINGS_ID as any },
    { $set: { ...next, updated_at: new Date().toISOString() } },
    { upsert: true }
  );

  return next;
}
