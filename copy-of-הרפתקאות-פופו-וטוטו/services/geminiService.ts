
import { GoogleGenAI, Type } from "@google/genai";
import { Story, StoryPage } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Using a very strict character description to maintain consistency across different image generation calls.
const CHARACTER_DESCRIPTION = `
Characters Visual Reference (MUST BE CONSISTENT IN EVERY IMAGE):
1. Toto: Older brother dwarf, TALLER and slimmer. Wearing exactly: Bright RED one-piece baby pajamas and a floppy RED Smurf-style cap. Clean-shaven young face, no beard.
2. Popo: Younger brother dwarf, SHORTER and chubbier. Wearing exactly: Bright BLUE one-piece baby pajamas and a floppy BLUE Smurf-style cap. Clean-shaven young face, no beard.
3. Snoopy: The classic white beagle dog with black ears and a black spot on his back.
Style: Professional 2D children's book illustration, flat colors, friendly, consistent characters, high resolution.
`;

export const generateStory = async (prompt: string, pageCount: number): Promise<Story> => {
  const totalRequestedPages = pageCount + 2;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `צור סיפור הרפתקאות לילדים בגילאי 4-6 על האחים הגמדים הצעירים טוטו ופופו והכלב שלהם סנופי.
    
    דמויות (חשוב: הם אחים, לא רק חברים):
    - טוטו: האח הבכור, גבוה, לובש אדום. הוא האח האחראי והבוגר שדואג לאחיו הקטן.
    - פופו: האח הצעיר, נמוך, לובש כחול. הוא האח השובב והצחקן שנוטה להסתבך בצרות.
    - סנופי: הכלב הנאמן של שני האחים.
    
    נושא ההרפתקה: ${prompt}

    מבנה הספר:
    1. עמוד 1: עמוד שער עם כותרת מנוקדת ומקורית שמתאימה להרפתקה.
    2. עמודים 2 עד ${pageCount + 1}: עמודי הסיפור המרכזיים. טוטו אומר "נו נו נו" לאחיו פופו *רק* כשהוא באמת עושה שטות או נקלע לבעיה.
    3. עמוד אחרון: המילה "סוף" מנוקדת.
    
    דרישות טקסט:
    - ניקוד מלא בעברית.
    - הדגש את הקשר החם בין האחים למרות השובבות של פופו.
    - אל תתאר לבוש או מראה חיצוני בטקסט.
    - הסיפור חייב לכלול בעיה שנגרמת בגלל פופו, ופתרון משותף עם סוף טוב.
    
    דרישות תמונה:
    - לכל עמוד סיפור, ספק תיאור תמונה באנגלית שמתאר את הסצנה במדויק.
    - תיאור התמונה חייב לציין תמיד שצריך לשמור על עקביות הדמויות כאחים גמדים (טוטו באדום וגבוה, פופו בכחול ונמוך).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ["text"]
            }
          }
        },
        required: ["title", "pages"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "{}") as Story;
    return data;
  } catch (e) {
    console.error("Failed to parse story JSON", e);
    throw new Error("שגיאה ביצירת הסיפור");
  }
};

  // Combining the global character reference with the specific page scene description.
export const generateImage = async (imagePrompt: string): Promise<string> => {
  if (!imagePrompt || imagePrompt.trim() === "") return "";

  try {
    // Combining the global character reference with the specific page scene description.
    const fullPrompt = `${CHARACTER_DESCRIPTION}
SCENE DESCRIPTION: ${imagePrompt}
REMEMBER: Toto and Popo are BROTHERS. Toto is tall in RED, Popo is short in BLUE. Both have young children's faces, NO BEARDS. Snoopy is always present. 2D Illustration style.`;

    // Using Pollinations.ai - a free image generation API
    // It works by encoding the prompt in the URL
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&model=flux&seed=${Math.floor(Math.random() * 10000)}`;
    
    // Return the URL directly - the browser will load it
    return imageUrl;
  } catch (error) {
    console.error("Failed to generate image", error);
    return `https://picsum.photos/seed/${Math.random()}/800/600`;
  }
};
