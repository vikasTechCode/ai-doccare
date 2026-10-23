// chatbot.js  -> in server.js:  app.use('/api', require('./chatbot'));
const express = require('express');
const natural = require('natural');
const pool = require('./db'); // your existing pg Pool: module.exports = new Pool({...})
const training = require('./training.json');

const router = express.Router();
const clean = (t) => t.toLowerCase().replace(/[^a-z0-9./\s]/g, ' ').replace(/\s+/g, ' ').trim();

// ---- training: base data + everything users taught the bot ----
let classifier;
async function trainModel() {
  let learned = [];
  try { learned = (await pool.query('SELECT text, intent FROM learned_data')).rows; } catch (e) {}
  const c = new natural.LogisticRegressionClassifier();
  [...training, ...learned].forEach((d) => c.addDocument(clean(d.text), d.intent));
  c.train();
  classifier = c;
  console.log('Chatbot trained on', training.length, '+', learned.length, 'learned samples');
}
trainModel();

// ---- keyword fallback: works even for sentences the model has never seen ----
const KEYWORDS = {
  headache: ['head', 'migraine', 'forehead', 'skull', 'temple'],
  fever: ['fever', 'temperature', 'shivering', 'chills', 'feverish'],
  cold_cough: ['cold', 'cough', 'sneez', 'nose', 'flu', 'phlegm', 'congest'],
  sore_throat: ['throat', 'tonsil', 'swallow'],
  stomach_pain: ['stomach', 'tummy', 'belly', 'gas', 'acid', 'bloat', 'abdomen', 'constipat'],
  diarrhea_vomiting: ['vomit', 'nausea', 'motion', 'diarrh', 'puke', 'threw'],
  body_pain: ['back', 'joint', 'knee', 'muscle', 'neck', 'shoulder', 'leg', 'ache', 'sprain'],
  fatigue: ['tired', 'weak', 'dizzy', 'exhaust', 'energy', 'fatigue'],
  skin_allergy: ['skin', 'rash', 'itch', 'pimple', 'acne', 'allerg', 'hair'],
  stress_anxiety: ['stress', 'anxi', 'tense', 'depress', 'panic', 'sad', 'worry', 'lonely', 'mood'],
  sleep: ['sleep', 'insomnia', 'awake'],
  bmi: ['bmi', 'overweight', 'underweight'],
  weight_loss: ['lose', 'loose', 'slim', 'fat', 'reduce weight'],
  weight_gain: ['gain', 'thin', 'skinny', 'bulk'],
  diabetes: ['sugar', 'diabet', 'insulin'],
  blood_pressure: ['bp', 'pressure', 'hypertens'],
  nutrition: ['diet', 'vitamin', 'protein', 'immunity', 'nutrition', 'eat'],
  exercise: ['exercise', 'workout', 'yoga', 'fitness', 'gym'],
  meditation: ['meditat', 'mindful', 'relax', 'breath'],
  eye_dental: ['eye', 'tooth', 'teeth', 'gum', 'vision', 'dental'],
  womens_health: ['period', 'menstru', 'pcos', 'pregnan'],
};
function keywordIntent(msg) {
  const words = msg.split(' ');
  let best = null, bestScore = 0;
  for (const [intent, keys] of Object.entries(KEYWORDS)) {
    const score = keys.filter((k) => words.some((w) => w.startsWith(k)) || msg.includes(k + ' ')).length;
    if (score > bestScore) { best = intent; bestScore = score; }
  }
  return best;
}

// ---- emergency check (always runs first) ----
const EMERGENCY = /chest pain|cant breathe|cannot breathe|difficulty breathing|breathing problem|unconscious|fainted|suicide|kill myself|want to die|heavy bleeding|seizure|heart attack|stroke/;

// ---- smart rules using numbers ----
function extraAdvice(intent, msg) {
  const nums = (msg.match(/\d+(\.\d+)?/g) || []).map(Number);
  if (!nums.length && intent !== 'bmi') return '';

  if (intent === 'bmi') {
    let bmi;
    const kg = msg.match(/(\d+(\.\d+)?)\s*(kg|kgs|kilo)/);
    const cm = msg.match(/(\d+(\.\d+)?)\s*cm/);
    if (kg && cm) bmi = +kg[1] / Math.pow(+cm[1] / 100, 2);
    else bmi = nums.find((n) => n >= 10 && n <= 60);
    if (!bmi) return 'Tell me your weight and height like "70 kg 170 cm", or your BMI value.';
    bmi = +bmi.toFixed(1);
    if (bmi < 18.5) return `BMI ${bmi}: Underweight. Eat more protein and healthy calories, and do strength training.`;
    if (bmi < 25) return `BMI ${bmi}: Normal. Great! Maintain your diet and daily activity.`;
    if (bmi < 30) return `BMI ${bmi}: Overweight. Walk 30-45 min daily, cut sugar and fried food.`;
    return `BMI ${bmi}: Obese range. Start a diet and exercise plan and consult a doctor.`;
  }

  if (intent === 'fever') {
    let t = nums.find((n) => (n >= 34 && n <= 43) || (n >= 94 && n <= 109));
    if (!t) return '';
    if (t > 50) t = (t - 32) * 5 / 9; // Fahrenheit -> Celsius
    if (t >= 40) return `Temperature ${t.toFixed(1)}°C is VERY HIGH. Go to a doctor/hospital immediately.`;
    if (t >= 39.4) return `Temperature ${t.toFixed(1)}°C is high. Please see a doctor today.`;
    if (t >= 38) return `Temperature ${t.toFixed(1)}°C is a fever. Rest, drink fluids, and monitor it.`;
    return `Temperature ${t.toFixed(1)}°C is normal or only slightly raised.`;
  }

  if (intent === 'blood_pressure') {
    const m = msg.match(/(\d{2,3})\s*(\/|over)\s*(\d{2,3})/);
    if (!m) return '';
    const [s, d] = [+m[1], +m[3]];
    if (s >= 180 || d >= 120) return `BP ${s}/${d}: Dangerously high. Seek medical help immediately.`;
    if (s >= 140 || d >= 90) return `BP ${s}/${d}: High. Reduce salt, rest, and see a doctor.`;
    if (s < 90 || d < 60) return `BP ${s}/${d}: Low. Drink water/ORS, sit down, and see a doctor if it continues.`;
    return `BP ${s}/${d}: Normal range.`;
  }

  if (intent === 'diabetes') {
    const v = nums.find((n) => n >= 40 && n <= 600);
    if (!v) return '';
    if (v >= 300) return `Sugar ${v} mg/dL is very high. See a doctor urgently.`;
    if (v >= 180) return `Sugar ${v} mg/dL is high. Follow your diet/medicines and consult your doctor.`;
    if (v < 70) return `Sugar ${v} mg/dL is low. Take sugar/juice now and get medical help if it persists.`;
    return `Sugar ${v} mg/dL looks within a reasonable range.`;
  }
  return '';
}

router.post('/chat', async (req, res) => {
  try {
    const raw = (req.body.message || '').toString().slice(0, 500);
    const msg = clean(raw);
    if (!msg) return res.json({ reply: { title: 'Hi', extra: 'Please type your symptoms or question.' } });

    if (EMERGENCY.test(msg)) {
      return res.json({
        intent: 'emergency',
        reply: {
          title: '⚠️ This may be an emergency',
          extra: 'Please call your local emergency number or go to the nearest hospital NOW. If you are thinking of harming yourself, contact someone you trust or a crisis helpline right away.',
        },
      });
    }

    const results = classifier.getClassifications(msg);
    const top = results[0];
    let intent = top && top.value >= 0.5 ? top.label : null;
    let source = 'model';

    if (!intent) {
      const kw = keywordIntent(msg);
      if (kw) { intent = kw; source = 'keyword'; }
    }

    // log anything the model was unsure about, so you can review it later
    if (source !== 'model' || !top) {
      pool.query('INSERT INTO unlabeled(message,guessed_intent,confidence) VALUES($1,$2,$3)',
        [raw, intent || (top && top.label), top ? top.value : 0]).catch(() => {});
    }

    // still no idea: ask the user what they meant (this is the "learning" moment)
    if (!intent) {
      const ids = results.slice(0, 3).map((r) => r.label);
      const { rows: opts } = await pool.query('SELECT intent,title FROM advice WHERE intent = ANY($1)', [ids]);
      return res.json({
        intent: 'unknown',
        needs_feedback: true,
        original_message: raw,
        reply: { title: 'I am still learning', extra: 'I did not fully understand. What did you mean? Tap one so I can learn:' },
        suggestions: opts,
      });
    }

    const { rows } = await pool.query('SELECT * FROM advice WHERE intent=$1', [intent]);
    const a = rows[0] || {};
    pool.query('INSERT INTO chat_history(message,intent) VALUES($1,$2)', [raw, intent]).catch(() => {});

    res.json({
      intent,
      source,
      original_message: raw,
      confidence: top ? +top.value.toFixed(2) : 0,
      reply: {
        title: a.title,
        extra: extraAdvice(intent, msg),
        precautions: a.precautions ? a.precautions.split('\n') : [],
        tips: a.tips ? a.tips.split('\n') : [],
        see_doctor_if: a.see_doctor_if ? a.see_doctor_if.split('\n') : [],
      },
      disclaimer: 'This is general information, not a medical diagnosis. Please consult a doctor for serious problems.',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---- user teaches the bot (thumbs up / pick the right topic) ----
router.post('/learn', async (req, res) => {
  try {
    const text = clean((req.body.message || '').toString().slice(0, 300));
    const intent = (req.body.intent || '').toString();
    if (!text || text.split(' ').length < 2) return res.status(400).json({ error: 'Message too short' });
    const ok = await pool.query('SELECT 1 FROM advice WHERE intent=$1', [intent]);
    if (!ok.rowCount) return res.status(400).json({ error: 'Unknown topic' });
    if (EMERGENCY.test(text)) return res.status(400).json({ error: 'Not allowed' });

    await pool.query('INSERT INTO learned_data(text,intent) VALUES($1,$2) ON CONFLICT DO NOTHING', [text, intent]);
    await trainModel(); // retrain right away, no server restart needed
    const { rows } = await pool.query('SELECT * FROM advice WHERE intent=$1', [intent]);
    const a = rows[0];
    res.json({
      intent, learned: true,
      reply: {
        title: a.title, extra: 'Thanks, I learned this!',
        precautions: a.precautions.split('\n'), tips: a.tips.split('\n'),
        see_doctor_if: a.see_doctor_if ? a.see_doctor_if.split('\n') : [],
      },
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// topics list for the "wrong answer? pick the right topic" button
router.get('/topics', async (req, res) => {
  const { rows } = await pool.query("SELECT intent,title FROM advice WHERE intent NOT IN ('greeting','thanks','about_bot') ORDER BY title");
  res.json(rows);
});

// review what the bot did not understand (good for your demo / admin page)
router.get('/unlabeled', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM unlabeled ORDER BY created_at DESC LIMIT 100');
  res.json(rows);
});

module.exports = router;
