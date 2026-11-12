import type { Experience } from "./types";

/**
 * Shape served by the public API.
 *
 * Author email, private contact details, and the extracted raw text stay out of
 * public responses. The owner and admins still receive the full document from
 * `GET /api/experiences/[id]` so the editors keep working.
 */

export interface PublicAuthor {
  name?: string | null;
  image?: string | null;
}

export interface PublicContacts {
  linkedin?: string | null;
}

export type PublicExperience = Omit<Experience, "author" | "contacts" | "raw_text"> & {
  author?: PublicAuthor;
  contacts?: PublicContacts;
};

export function toPublicExperience(experience: Experience): PublicExperience {
  // Legacy imports also stored a `candidate_contacts` array; keep it private too.
  const source = experience as Experience & { candidate_contacts?: unknown };
  const {
    author,
    contacts,
    raw_text: _rawText,
    candidate_contacts: _candidateContacts,
    ...rest
  } = source;

  const publicExperience: PublicExperience = { ...rest };

  if (author) {
    publicExperience.author = {
      name: author.name ?? null,
      image: author.image ?? null,
    };
  }

  if (contacts?.linkedin) {
    publicExperience.contacts = { linkedin: contacts.linkedin };
  }

  return publicExperience;
}

export function toPublicExperiences(experiences: Experience[]): PublicExperience[] {
  return experiences.map(toPublicExperience);
}
