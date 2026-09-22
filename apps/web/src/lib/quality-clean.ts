import type { Experience } from "@/lib/types";

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

  return cleanedExp;
}
