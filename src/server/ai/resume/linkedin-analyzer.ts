import { runAI } from "@/server/ai/core/orchestrator"; ;
import { urlToText } from "@/server/utils/url-to-text";

type LinkedinAnalysisResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestedSkills: string[];
};
export async function analyzeLinkedinProfile(
  input: string
):Promise<LinkedinAnalysisResult | null> {

  const text = await urlToText(input);

  if(!text ||text.length < 20) {
    return null;
  }
  const prompt = `
Analyze LinkedIn profile.

Return JSON:

{
 score: number,
 strengths: string[],
 weaknesses: string[],
 suggestedSkills: string[]
}

Profile:
${text}
`;const result = await runAI<LinkedinAnalysisResult>(prompt)


  return result ?? null;
}