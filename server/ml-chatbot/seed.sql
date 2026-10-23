CREATE TABLE IF NOT EXISTS advice (
  intent TEXT PRIMARY KEY,
  title TEXT,
  precautions TEXT,
  tips TEXT,
  see_doctor_if TEXT
);

CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  message TEXT,
  intent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO advice (intent,title,precautions,tips,see_doctor_if) VALUES
($$fever$$,$$Fever$$,$$Rest well and sleep as much as possible.
Drink plenty of water, ORS, soups and coconut water.
Wear light clothes and use a lukewarm sponge bath.
Take paracetamol only as per label or doctor advice.$$,$$Check temperature every 4-6 hours.
Eat light food like khichdi, fruits and soup.$$,$$Temperature stays above 39.4°C (103°F)
Fever lasts more than 3 days
Severe headache, rash, stiff neck or breathing trouble
The patient is a baby, elderly person or pregnant$$),
($$cold_cough$$,$$Cold and Cough$$,$$Drink warm water, tea with ginger and honey.
Take steam inhalation 2-3 times a day.
Gargle with warm salt water.
Rest and avoid cold drinks and dust.$$,$$Keep your head slightly raised while sleeping.
Wash hands often and cover your mouth when coughing.$$,$$Cough lasts more than 2 weeks
Blood in cough or chest pain
Breathing difficulty or wheezing
Fever above 39°C along with cough$$),
($$sore_throat$$,$$Sore Throat$$,$$Gargle with warm salt water 3-4 times a day.
Drink warm fluids like tea, soup or turmeric milk.
Avoid cold, oily and spicy food.
Rest your voice.$$,$$Honey with warm water soothes the throat.
Use a humidifier or steam.$$,$$Pain lasts more than a week
Difficulty swallowing or breathing
High fever or white patches on tonsils$$),
($$headache$$,$$Headache$$,$$Rest in a quiet, dark room.
Drink enough water, dehydration is a common cause.
Place a cool cloth on your forehead.
Avoid screens for a while and gently massage temples.$$,$$Sleep 7-8 hours and do not skip meals.
Limit caffeine and manage stress.$$,$$Sudden, very severe headache
Headache with fever, stiff neck, vomiting or confusion
Headache after a head injury
Frequent headaches every week$$),
($$stomach_pain$$,$$Stomach Problems$$,$$Eat small, light meals like rice, banana and curd.
Drink warm water or jeera water.
Avoid spicy, oily food, tea and soft drinks.
Do not lie down right after eating.$$,$$Walk gently for 10 minutes after meals.
Increase fibre and water for constipation.$$,$$Severe or constant pain
Blood in stool or black stool
Pain with high fever or repeated vomiting
Pain lasting more than 2 days$$),
($$diarrhea_vomiting$$,$$Loose Motions / Vomiting$$,$$Sip ORS or salted water often to avoid dehydration.
Eat bland food: rice, banana, toast, curd.
Avoid milk, outside food and oily items.
Rest well and wash hands often.$$,$$Take small sips instead of large gulps if vomiting.$$,$$Signs of dehydration: very dry mouth, little urine, dizziness
Blood in stool or vomit
Symptoms last more than 2 days
High fever or severe stomach pain$$),
($$body_pain$$,$$Body / Joint / Muscle Pain$$,$$Rest the painful area and avoid heavy lifting.
Use a warm compress for stiffness, cold pack for fresh injury or swelling.
Do gentle stretching.
Maintain good posture while sitting.$$,$$Stay hydrated and get enough sleep.
A light walk helps back and joint stiffness.$$,$$Pain after a fall or injury
Swelling, redness or inability to move the joint
Numbness or weakness in legs or arms
Pain lasting more than a week$$),
($$fatigue$$,$$Tiredness / Weakness$$,$$Sleep 7-8 hours at a fixed time.
Drink enough water and eat regular meals.
Include iron-rich foods: spinach, dates, jaggery, eggs.
Do light exercise or a daily walk.$$,$$Reduce caffeine and screen time at night.
Get vitamin D from morning sunlight.$$,$$Tiredness lasts more than 2 weeks
Dizziness, fainting or breathlessness
Sudden weight loss
Pale skin or fast heartbeat$$),
($$skin_allergy$$,$$Skin Problems / Allergy$$,$$Do not scratch the area.
Wash with mild soap and cool water.
Apply a moisturizer or calamine lotion.
Avoid the suspected trigger (food, dust, new product).$$,$$Wear loose cotton clothes.
Keep skin clean and dry.$$,$$Swelling of face, lips or throat
Breathing difficulty
Rash spreading fast or with fever
Pus, pain or no improvement after 5-7 days$$),
($$stress_anxiety$$,$$Stress and Anxiety$$,$$Take 5 slow deep breaths: inhale 4 sec, hold 4 sec, exhale 6 sec.
Talk to a friend or family member about how you feel.
Take short breaks and go for a walk outside.
Limit caffeine and social media.$$,$$Write down your worries and make a small to-do list.
Sleep well and exercise regularly.
Try 10 minutes of meditation daily.$$,$$Feeling hopeless for more than 2 weeks
Panic attacks happening often
Thoughts of harming yourself (seek help immediately)
Stress affects sleep, work or relationships$$),
($$sleep$$,$$Sleep Problems$$,$$Sleep and wake at the same time every day.
Avoid phone and TV 1 hour before bed.
No tea, coffee or heavy food at night.
Keep the room dark, cool and quiet.$$,$$Try a warm bath or warm milk before bed.
Do 5 minutes of deep breathing in bed.$$,$$Sleep problems last more than 3 weeks
Loud snoring with pauses in breathing
Extreme daytime sleepiness$$),
($$bmi$$,$$BMI (Body Mass Index)$$,$$BMI ranges: below 18.5 underweight, 18.5-24.9 normal, 25-29.9 overweight, 30+ obese.
BMI = weight(kg) / height(m) squared.$$,$$Combine a balanced diet with 30 minutes of daily activity.
Sleep well and drink enough water.$$,$$BMI is below 17 or above 30
Sudden weight change without reason$$),
($$weight_loss$$,$$Healthy Weight Loss$$,$$Eat more vegetables, fruits, protein and fibre.
Cut sugar, soft drinks, fried and packaged food.
Walk 30-45 minutes daily plus some strength exercise.
Drink water before meals and sleep 7-8 hours.$$,$$Aim for 0.5 kg loss per week; avoid crash diets.
Eat slowly and control portion sizes.$$,$$You have diabetes, thyroid or heart problems
Losing weight very fast
No results after 2-3 months of consistent effort$$),
($$weight_gain$$,$$Healthy Weight Gain$$,$$Eat 5-6 small meals a day.
Add protein: eggs, milk, paneer, dal, nuts, chicken.
Include healthy calories: banana, peanut butter, ghee, dry fruits.
Do strength training so weight is muscle, not just fat.$$,$$Sleep 8 hours and avoid skipping meals.$$,$$Weight stays low despite good diet
Unexplained weight loss, constant hunger or thirst$$),
($$diabetes$$,$$Blood Sugar / Diabetes$$,$$Reduce sugar, sweets, white rice and maida.
Eat more fibre: vegetables, oats, dal, whole grains.
Walk 30 minutes daily, especially after meals.
Take medicines exactly as prescribed and check sugar regularly.$$,$$Keep a regular meal timing.
Manage stress and sleep well.$$,$$Fasting sugar above 126 mg/dL or after-meal above 200 mg/dL
Excess thirst, frequent urination, blurry vision
Sugar above 300 or below 70 (urgent)$$),
($$blood_pressure$$,$$Blood Pressure$$,$$Reduce salt, pickles, chips and processed food.
Walk or do yoga for 30 minutes daily.
Limit alcohol, smoking and stress.
Check BP regularly and take medicines on time.$$,$$Eat bananas, leafy greens and fruits.
For low BP drink water, ORS and do not stand up suddenly.$$,$$BP above 140/90 repeatedly
BP above 180/120 (emergency)
Severe headache, chest pain or blurry vision with high BP
Fainting with low BP$$),
($$nutrition$$,$$Healthy Diet and Immunity$$,$$Fill half your plate with vegetables and fruits.
Include protein (dal, eggs, milk, paneer) in each meal.
Choose whole grains over refined flour.
Drink 2-3 litres of water daily.$$,$$Add nuts, seeds and curd for gut health.
Limit junk food, sugar and fried items.
Get sunlight and 7-8 hours of sleep for immunity.$$,$$Suspected deficiency (hair fall, weakness, pale skin): get blood tests
Have a medical condition needing a special diet$$),
($$exercise$$,$$Exercise and Fitness$$,$$Aim for 30 minutes of activity at least 5 days a week.
Mix walking, strength exercises and stretching.
Warm up before and cool down after exercise.
Start slow and increase gradually.$$,$$Beginner yoga: surya namaskar, tadasana, bhujangasana.
Take the stairs and stand up every hour.$$,$$Chest pain or dizziness during exercise
You have heart problems or an injury
New pain that does not go away$$),
($$meditation$$,$$Meditation and Relaxation$$,$$Sit comfortably, close your eyes, and focus on your breath for 5-10 minutes.
Try box breathing: inhale 4, hold 4, exhale 4, hold 4.
Try body scan: relax each body part from head to toe.
Practice at the same time daily, morning is best.$$,$$Try pranayama like anulom vilom.
Use a quiet place and silence your phone.
When the mind wanders, gently bring attention back to the breath.$$,$$Meditation does not help ongoing low mood or anxiety
You feel overwhelmed or have thoughts of self-harm$$),
($$eye_dental$$,$$Eye / Dental Care$$,$$Do not rub your eyes; wash with clean water.
Rest eyes from screens: look 20 feet away every 20 minutes.
For toothache, rinse with warm salt water and brush gently twice a day.
Avoid very hot, cold or sugary food.$$,$$Floss daily and change toothbrush every 3 months.
Eat vitamin A foods: carrot, spinach, eggs.$$,$$Eye pain with vision loss or injury
Swelling in face or jaw
Tooth pain lasting more than 2 days
Bleeding gums that do not stop$$),
($$womens_health$$,$$Women's Health$$,$$Use a warm compress or hot water bag for period cramps.
Drink warm water and herbal tea; light walking helps.
Eat iron-rich foods: spinach, dates, beetroot.
Track your cycle on a calendar or app.$$,$$Sleep well and reduce stress.
Gentle yoga can ease cramps.$$,$$Very heavy bleeding (soaking a pad every hour)
Periods missing for more than 3 months
Severe pain that affects daily life
Any pregnancy-related concern$$),
($$greeting$$,$$Hello!$$,$$Hi! I'm your health assistant. Tell me your symptoms or health question.$$,$$Example: "I have fever", "my BMI is 28", "I can't sleep", "how to reduce stress".$$,$$$$),
($$thanks$$,$$You're welcome!$$,$$Happy to help. Take care of your health!$$,$$Feel free to ask anything else.$$,$$$$),
($$about_bot$$,$$About me$$,$$I'm an AI health assistant trained on common health topics. I give general advice on symptoms, BMI, diet, sleep, stress and more.$$,$$I'm not a doctor and cannot diagnose. For serious problems, please visit a doctor.$$,$$$$)
ON CONFLICT (intent) DO NOTHING;
