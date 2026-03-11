import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateProposalContent = async (
  clientName: string,
  projectType: string,
  requirements: string
): Promise<string> => {
  try {
    const prompt = `
      Write a professional project proposal introduction and scope summary for a creative agency called "Spiritus Agency".
      Client: ${clientName}
      Project Type: ${projectType}
      Key Requirements: ${requirements}
      
      Tone: Professional, Innovative, Confidence-inspiring.
      Format: Markdown. Keep it under 300 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate proposal content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please check your API key.";
  }
};

export const generateSOP = async (topic: string): Promise<string> => {
  try {
    const prompt = `
      Create a Standard Operating Procedure (SOP) for "${topic}" for a web development and AI agency.
      Structure:
      1. Objective
      2. Scope
      3. Procedure (Step-by-step)
      4. Quality Control
      
      Format: Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate SOP.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating SOP.";
  }
};

export const analyzeProjectRisk = async (projectData: string): Promise<string> => {
    try {
        const prompt = `
          Analyze the following project data for potential risks or bottlenecks.
          Data: ${projectData}
          
          Provide a concise list of 3 potential risks and mitigation strategies.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 } 
            }
        });
        return response.text || "No analysis available.";
    } catch (error) {
        console.error("Gemini API Error", error);
        return "Could not analyze risks.";
    }
}

export const generateOnboardingChecklist = async (projectType: string): Promise<string[]> => {
    try {
        const prompt = `
            Generate a 5-item onboarding checklist for a client starting a "${projectType}" project with a digital agency.
            Return ONLY the checklist items as a JSON array of strings. 
            Example output: ["Sign NDA", "Setup Slack Channel", "Kickoff Call"]
            Do not include markdown formatting or 'json' tags. Just the raw array.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text || "[]";
        // Clean up any potential markdown code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini API Error", error);
        return ["Initial Consultation", "Sign Contract", "Receive Deposit", "Project Kickoff", "Asset Collection"];
    }
}

export const generateLegalContract = async (type: string, clientName: string, details: string): Promise<string> => {
    try {
        const prompt = `
            Draft a formal legal document: "${type}" between "Spiritus Agency" (Provider) and "${clientName}" (Client).
            
            ${details}
            
            Requirements:
            - Professional legal tone.
            - Ensure clauses for Jurisdiction and Payment are included if specified in the details.
            - Include standard clauses for digital agency work (Confidentiality, IP rights, Termination, Indemnification).
            - Format using Markdown for headers (##) and lists.
            - Do not include placeholders like "[Date]" unless strictly necessary. Use the provided effective date or today's date: ${new Date().toLocaleDateString()}.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });

        return response.text || "Unable to generate contract.";
    } catch (error) {
        console.error("Gemini API Error", error);
        return "Error generating contract text.";
    }
}
