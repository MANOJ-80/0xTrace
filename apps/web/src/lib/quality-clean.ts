import type { Experience } from "@/lib/types";

function maskEmail(email: string): string {
  if (!email) return email;
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [username, domain] = parts;
  if (username.length <= 1) return `*@${domain}`;
  return `${username[0]}${'*'.repeat(Math.max(1, username.length - 2))}${username[username.length - 1]}@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone) return phone;
  const numeric = phone.replace(/\D/g, '');
  if (numeric.length < 8) return phone;
  return phone.replace(/\d/g, (match, offset, str) => {
    let digitIndex = 0;
    for(let i=0; i<=offset; i++) if (/\d/.test(str[i])) digitIndex++;
    if (digitIndex <= 2 || digitIndex > numeric.length - 2) return match;
    return '*';
  });
}

function redactText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  let redacted = text.replace(emailRegex, (match, username, domain) => {
    if (username.length <= 1) return `*@${domain}`;
    return `${username[0]}${'*'.repeat(Math.max(1, username.length - 2))}${username[username.length - 1]}@${domain}`;
  });
  
  const phoneRegex = /(?:(?:\+|00)\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;
  redacted = redacted.replace(phoneRegex, (match) => {
    const numCount = (match.match(/\d/g) || []).length;
    if (numCount >= 8 && numCount <= 15) {
      return maskPhone(match);
    }
    return match;
  });
  
  return redacted;
}

// Helper for deep redaction of the entire extracted object
export function redactObject<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item)) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key === 'contacts') {
        newObj[key] = { ...(obj as any)[key] };
        if (newObj[key].email) newObj[key].email = maskEmail(newObj[key].email);
        if (newObj[key].phone) newObj[key].phone = maskPhone(newObj[key].phone);
      } else {
        newObj[key] = redactObject((obj as any)[key]);
      }
    }
    return newObj as T;
  } else if (typeof obj === 'string') {
    return redactText(obj) as unknown as T;
  }
  return obj;
}

export function cleanExtractedExperience(exp: Experience): Experience {
  const cleanedExp = { ...exp };
  
  const normalizeText = (text: string) => {
    if (!text) return text;
    return text
      .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '') // remove control chars except \n and \t
      .replace(/\n{3,}/g, '\n\n') // collapse multiple blank lines
      .trim();
  };
  
  const standardizeBullets = (text: string) => {
    if (!text) return text;
    return text.replace(/[\u2219\u27a2\uf0b7]/g, '• ').replace(/^o /gm, '• ');
  };

  if (cleanedExp.rounds) {
    cleanedExp.rounds = cleanedExp.rounds.map(round => {
      let description = round.description || "";
      
      // 1. Strip metadata headers
      description = description.replace(/Round \d+\nType:.*\nMode:.*\nDuration:.*\nDifficulty level:.*/ig, '');
      
      // 8. Extract trailing tips
      const tipsMatch = description.match(/\(Note:\s*1\).*$/is);
      if (tipsMatch) {
        const extractedTips = tipsMatch[0]
          .split(/\d\)/)
          .map(t => t.replace('(Note:', '').trim())
          .filter(t => t);
        cleanedExp.tips = [...(cleanedExp.tips || []), ...extractedTips];
        description = description.replace(/\(Note:\s*1\).*$/is, '').trim();
      }

      // 2 & 3. Normalize whitespace and standardize bullets
      description = standardizeBullets(normalizeText(description));
      
      // 4. Deduplicate questions
      if (round.questions) {
        const seenQuestions = new Set();
        round.questions = round.questions.filter(q => {
          const qText = q.question.toLowerCase().trim();
          if (seenQuestions.has(qText)) return false;
          seenQuestions.add(qText);
          return true;
        });
      }

      // 6. Clean round names
      let name = round.name;
      name = name.replace(/^[^a-zA-Z0-9]+/, '').trim();
      if (!name.toLowerCase().startsWith('round')) {
        name = `Round ${round.sequence}: ${name}`;
      }

      // 7. Normalize round types
      let type = (round.type || 'unknown').toLowerCase();
      if (type.includes('technical')) type = 'technical_interview';
      else if (type.includes('hr')) type = 'hr_interview';
      else if (type.includes('online')) type = 'online_assessment';

      return { ...round, description, name, type };
    });
  }

  // 5. Deduplicate tips
  if (cleanedExp.tips) {
    const seenTips = new Set();
    cleanedExp.tips = cleanedExp.tips.filter(tip => {
      const tText = tip.toLowerCase().trim();
      if (seenTips.has(tText)) return false;
      seenTips.add(tText);
      return true;
    });
  }

  return redactObject(cleanedExp);
}
