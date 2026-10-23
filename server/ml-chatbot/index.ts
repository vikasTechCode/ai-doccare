
import natural from "natural";
import training from "./training.json";
import { pool } from "../db";

type TrainingSample = {
  text: string;
  intent: string;
};

const samples = training as TrainingSample[];
const classifier = new natural.LogisticRegressionClassifier();

const clean = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9./\s]/g, " ").replace(/\s+/g, " ").trim();

for (const sample of samples) {
  classifier.addDocument(clean(sample.text), sample.intent);
}

classifier.train();

const emergencyPattern =
  /chest pain|can't breathe|cannot breathe|difficulty breathing|breathing problem|unconscious|fainted|suicide|kill myself|want to die|heavy bleeding|seizure|heart attack|stroke/i;

const advice: Record<string, string> = {
  greeting: "Hello! I'm your AI health assistant. What health question can I help you with?",
  thanks: "You're welcome! Take care of your health.",
  about_bot: "I'm your AI health assistant. I provide general health information, not a medical diagnosis.",
  fever: "For a fever, rest, drink fluids, and monitor your temperature. Seek medical advice if it is high, persistent, or you feel seriously unwell.",
  cold_cough: "Rest, drink fluids, and monitor your symptoms. Seek medical advice if breathing becomes difficult or symptoms worsen.",
  headache: "Rest, drink water, and avoid possible triggers. Seek urgent help for a sudden severe headache or headache with weakness, confusion, or vision changes.",
  sore_throat: `Throat Pain Care:
1. Drink plenty of fluids and warm drinks to soothe your throat.
2. Rest your voice and avoid shouting.
3. Gargle with warm salt water if appropriate for your age.
4. Avoid smoke and other throat irritants.
5. Get enough rest and eat soft foods if swallowing is uncomfortable.
6. Use the symptom checker for general guidance, but do not rely on it for diagnosis; seek medical attention if symptoms are severe or persistent.
7. Seek emergency medical help if you have difficulty breathing or cannot swallow.`,
  stomach_pain: "Drink fluids and monitor your symptoms. Severe or worsening abdominal pain needs prompt medical assessment.",
  diarrhea_vomiting: `Diarrhea and Vomiting Care:
1. Drink oral rehydration solution (ORS) in small, frequent sips to prevent dehydration.
2. Drink safe water and eat light foods such as rice, bananas, toast, or soup as tolerated.
3. Avoid oily, spicy foods and sugary drinks.
4. Eat small meals when you feel able; do not force yourself to eat.
5. Rest and monitor for signs of dehydration, such as dark urine or dizziness.
6. Seek medical help for blood in stool or vomit, severe abdominal pain, or persistent vomiting.
7. Get urgent medical care for severe dehydration, confusion, or inability to keep fluids down.`,
  body_pain: "Rest and avoid activities that worsen the pain. Use our Symtoms Checker chat and Seek medical advice for severe, persistent, or unexplained pain.",
  fatigue: `Fatigue Management:
1. Aim for 7–9 hours of sleep each night if you are an adult.
2. Eat balanced meals with fruits, vegetables, and protein-rich foods.
3. Drink enough water throughout the day.
4. Do light exercise, such as walking, as tolerated.
5. Maintain a regular sleep schedule and take breaks when needed.
6. Avoid excessive caffeine and maintain healthy daily habits.
7. Consult a clinician if fatigue persists, is unexplained, or affects daily activities.`,
  skin_allergy: `Skin Allergy Care:
1. Avoid suspected allergens and do not scratch irritated skin.
2. Use a cool compress to soothe itching and irritation.
3. Use gentle, fragrance-free skin care products.
4. Avoid new creams or products that may worsen the reaction.
5. Use the symptom checker for general guidance, but do not rely on it for diagnosis.
6. Seek medical attention if the rash worsens, spreads, or persists.
7. Facial or throat swelling, difficulty breathing, or faintness is an emergency. Seek emergency medical help immediately.`,
  stress_anxiety: `Stress and Anxiety Management:
1. Practice slow, deep breathing for a few minutes.
2. Try meditation, gentle yoga, or relaxation exercises.
3. Maintain regular sleep and eat balanced meals.
4. Take short breaks and go for a walk if possible.
5. Talk to someone you trust about your feelings.
6. Use the symptom checker for general guidance, but do not rely on it for diagnosis; seek professional help when needed.
7. Consult a mental health professional if symptoms persist or affect daily life. If you feel unsafe or may harm yourself, seek immediate help.`,
  sleep: "Keep a regular sleep schedule and reduce caffeine late in the day. Seek help if sleep problems persist.",
  bmi: "I can give general BMI information. Share your weight in kilograms and height in centimetres if you want help calculating it.",
  weight_loss: `Weight Loss Diet Plan:
1. Calculate your daily calorie needs using a TDEE calculator based on age, sex, height, weight, and activity level.
2. Eat 300–400 calories below your maintenance calories for gradual weight loss.
3. Include protein such as eggs, dal, paneer, curd, beans, or chicken.
4. Eat vegetables, fruits, and whole grains.
5. Limit sugary drinks, fried foods, and high-calorie snacks.
6. Drink water, exercise regularly, and sleep 7–9 hours if you're an adult.
7. Track your weight weekly and adjust gradually.`,
  weight_gain: `Weight Gain Diet Plan:
1. Calculate your daily calorie needs using your age, sex, height, weight, and activity level with a TDEE calculator.
2. Eat around 300–500 calories above your daily maintenance calories for gradual weight gain.
3. Include protein-rich foods like eggs, milk, paneer, dal, beans, nuts, and chicken.
4. Eat balanced meals with rice, roti, potatoes, whole grains, fruits, and vegetables.
5. Add nutritious snacks like bananas, peanut butter, yogurt, nuts, and smoothies.
6. Do strength training regularly to help build muscle and get 7–9 hours of sleep if you're an adult.
7. Track your weight weekly and adjust your calorie intake gradually.`,
  diabetes: `Diabetes Diet Plan:
1. Eat balanced meals with controlled portions of carbohydrates, such as whole grains, roti, and brown rice.
2. Include protein-rich foods like dal, beans, eggs, paneer, and fish.
3. Eat plenty of non-starchy vegetables and whole fruits instead of fruit juice.
4. Limit sugary drinks, sweets, and highly processed foods.
5. Eat meals regularly and monitor your blood sugar as advised by your clinician.
6. Drink water regularly and include physical activity as recommended for you.
7. Follow your prescribed diabetes care plan. Never change medication based on this chat.`,
  blood_pressure: `Blood Pressure Management:
1. Reduce salt intake and limit packaged, processed, and salty foods.
2. Eat fruits, vegetables, whole grains, and low-fat dairy products.
3. Monitor your blood pressure regularly as advised by your clinician.
4. Exercise regularly, such as brisk walking, if safe for you.
5. Maintain a healthy weight and limit alcohol.
6. Take prescribed blood pressure medicines as directed.
7. Seek urgent medical care for blood pressure above 180/120 mmHg with chest pain, breathlessness, weakness, or vision or speech changes.`,
  nutrition: `General Nutrition Guidelines:
1. Eat a variety of foods, including vegetables, fruits, whole grains, and protein sources.
2. Include protein from foods such as dal, beans, eggs, nuts, paneer, or fish.
3. Choose healthy fats and limit foods high in added sugar, excess salt, and unhealthy fats.
4. Drink enough water throughout the day.
5. Eat regular, balanced meals and choose portions that suit your energy needs.
6. Maintain a varied diet rather than following restrictive diets or skipping meals.
7. Use the symptom checker for general guidance only; do not rely on it for diagnosis. Seek medical advice for individual dietary needs or health concerns.`,
  exercise: `Daily Exercise Plan:
1. Start your day with 5–10 minutes of warm-up and stretching.
2. Walk briskly for 20–30 minutes daily.
3. Try simple exercises like squats, push-ups, and lunges according to your fitness level.
4. Take the stairs and avoid sitting for long periods.
5. Practice yoga or stretching to improve flexibility and relaxation.
6. Drink enough water and rest when needed.
7. Start slowly and gradually increase exercise duration as your fitness improves.`,
  meditation: "Try a few minutes of comfortable, slow breathing in a quiet place. Stop if it makes you feel worse.",
  eye_dental: `Eye and Dental Care Tips:
1. Brush twice daily and floss regularly to maintain oral hygiene.
2. Visit a dentist regularly for checkups and cleaning.
3. Avoid excessive sugary foods and drinks to protect your teeth.
4. Rest your eyes regularly during screen use and follow good lighting habits.
5. Schedule routine eye checkups and use prescribed glasses if needed.
6. Seek prompt professional care for severe pain, sudden vision changes, or facial swelling.
7. The AI DocCare Symptom Checker provides general guidance only, not a medical diagnosis.`,
  womens_health: `Women's Health Guidance:
1. Maintain a balanced diet, regular physical activity, and adequate sleep.
2. Track menstrual cycles and note any unusual changes or symptoms.
3. Attend routine health checkups and age-appropriate screenings.
4. Seek medical advice for severe period pain, unusual bleeding, or persistent symptoms.
5. Maintain good personal hygiene and seek advice about any concerns.
6. Use the AI DocCare Symptom Checker for general guidance, but do not rely on it for diagnosis.
7. Consult a qualified healthcare professional for advice tailored to your symptoms and health needs.`
};

export async function getMLChatResponse(message: string): Promise<string> {
  const raw = message.trim().slice(0, 500);

  if (!raw) {
    return "Please type a health question.";
  }

  if (emergencyPattern.test(raw)) {
    return "⚠️ This may be an emergency. Contact local emergency services or go to the nearest emergency department now. This chatbot cannot assess emergencies.";
  }

  const text = clean(raw);
  if (
  /\b(who (made|created|developed) you|who is your developer|who built you)\b/i.test(text)
) {
  return "I'm the AI Health Assistant in AI DocCare. I was configured by the vikas of this project using a custom ML chatbot.";
}

// Handle common questions explicitly before ML classification.
if (
  /\b(who (made|created|developed) you|who is your developer|who built you)\b/i.test(text)
) {
  return "I'm the AI Health Assistant in AI DocCare. I was configured by the developers of this project using a custom ML chatbot.";
}

if (/\b(high fever|very high fever|fever is very high)\b/i.test(text)) {
  return "For a high fever, measure your temperature and drink fluids if you can. Seek urgent medical advice if the fever is very high, persistent, or accompanied by confusion, difficulty breathing, a stiff neck, a seizure, or severe weakness. Do not rely on home remedies alone.";
}

if (/\b(watery nose|runny nose|running nose)\b/i.test(text)) {
  return "A runny nose may happen with a cold or allergies. Rest, drink fluids, and consider saline nasal spray. Seek medical advice if symptoms worsen, persist, or you have difficulty breathing.";
}

const results = classifier.getClassifications(text);
const top = results[0];

let intent = top && top.value >= 0.3 ? top.label : "";

  if (!intent) {
    const words = clean(raw).split(" ");
    const keywordMap: Record<string, string[]> = {
      fever: ["fever", "temperature", "chills"],
      cold_cough: ["cold", "cough", "sneeze", "flu"],
      headache: ["headache", "migraine"],
      sore_throat: ["throat", "tonsil"],
      stomach_pain: ["stomach", "tummy", "belly"],
      diarrhea_vomiting: ["vomit", "nausea", "diarrhea"],
      body_pain: ["backache", "joint", "muscle", "ache"],
      fatigue: ["tired", "weak", "fatigue"],
      stress_anxiety: ["stress", "anxiety", "panic", "worry"],
      sleep: ["sleep", "insomnia"],
      diabetes: ["diabetes", "sugar", "insulin"],
      blood_pressure: ["pressure", "hypertension"],
      nutrition: ["diet", "nutrition", "protein"],
      exercise: ["exercise", "workout", "fitness"],
    };

    for (const [candidate, keywords] of Object.entries(keywordMap)) {
      if (keywords.some((word) => words.some((w) => w.includes(word)))) {
        intent = candidate;
        break;
      }
    }
  }

  if (!intent) {
    return "I'm not sure I understood. Could you describe your health question in simpler words? I can provide general information, but I cannot diagnose illness.";
  }

  return advice[intent] ??
    "I can provide general health information, but please consult a qualified healthcare professional for personal medical advice.";
}
