export interface ExerciseTemplate {
  id: string;
  name: string;
  nameEn: string;
  muscle: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  imageUrl?: string;
}

export const EXERCISE_DATABASE: Record<string, ExerciseTemplate[]> = {
  'صدر': [
    { id: 'chest-1', name: 'ضغط البنش المستوي بالبار', nameEn: 'Barbell Bench Press', muscle: 'صدر', description: 'تمرين أساسي لبناء عضلات الصدر الوسطى والقوة العامة', difficulty: 'beginner', equipment: ['بار', 'بنش مستوي'] },
    { id: 'chest-2', name: 'ضغط البنش المائل بالدمبل', nameEn: 'Incline Dumbbell Press', muscle: 'صدر', description: 'يستهدف الجزء العلوي من الصدر', difficulty: 'beginner', equipment: ['دمبل', 'بنش مائل'] },
    { id: 'chest-3', name: 'فتح الصدر بالدمبل', nameEn: 'Dumbbell Flyes', muscle: 'صدر', description: 'تمرين عزل لتوسيع الصدر', difficulty: 'intermediate', equipment: ['دمبل', 'بنش'] },
    { id: 'chest-4', name: 'الضغط على الكابل', nameEn: 'Cable Crossover', muscle: 'صدر', description: 'تمرين عزل ممتاز للصدر السفلي', difficulty: 'intermediate', equipment: ['كابل'] },
    { id: 'chest-5', name: 'تمرين الضغط', nameEn: 'Push-ups', muscle: 'صدر', description: 'تمرين وزن الجسم الكلاسيكي', difficulty: 'beginner', equipment: [] },
    { id: 'chest-6', name: 'ضغط البنش المنخفض', nameEn: 'Decline Bench Press', muscle: 'صدر', description: 'يستهدف الجزء السفلي من الصدر', difficulty: 'intermediate', equipment: ['بار', 'بنش منخفض'] },
    { id: 'chest-7', name: 'ضغط على الأرض', nameEn: 'Floor Press', muscle: 'صدر', description: 'بديل لبنش الضغط لتقليل نطاق الحركة وحماية الكتفين.', difficulty: 'beginner', equipment: ['بار', 'دمبل'] },
    { id: 'chest-8', name: 'ضغط آلة سميث', nameEn: 'Smith Machine Bench Press', muscle: 'صدر', description: 'نسخة أكثر استقرارًا من ضغط البنش، رائعة للمبتدئين.', difficulty: 'beginner', equipment: ['آلة سميث'] },
    { id: 'chest-9', name: 'ضغط الصدر بالآلة', nameEn: 'Machine Chest Press', muscle: 'صدر', description: 'تمرين آمن وموجه لعضلات الصدر.', difficulty: 'beginner', equipment: ['آلة'] },
    { id: 'chest-10', name: 'تفتيح بالكابل على بنش مائل', nameEn: 'Incline Cable Flyes', muscle: 'صدر', description: 'يستهدف الصدر العلوي بتوتر مستمر.', difficulty: 'intermediate', equipment: ['كابل', 'بنش مائل'] },
    { id: 'chest-11', name: 'غطس للصدر', nameEn: 'Chest Dips', muscle: 'صدر', description: 'تمرين وزن الجسم المتقدم الذي يركز على الصدر السفلي.', difficulty: 'advanced', equipment: ['جهاز غطس'] },
    { id: 'chest-12', name: 'ضغط سفيند', nameEn: 'Svend Press', muscle: 'صدر', description: 'تمرين ضغط متساوي القياس لزيادة تفعيل الصدر الداخلي.', difficulty: 'intermediate', equipment: ['لوح وزن'] },
  ],
  'ظهر': [
    { id: 'back-1', name: 'الرفعة المميتة', nameEn: 'Deadlift', muscle: 'ظهر', description: 'تمرين مركب لكامل الظهر والجسم', difficulty: 'intermediate', equipment: ['بار'] },
    { id: 'back-2', name: 'سحب أمامي عريض', nameEn: 'Wide Grip Lat Pulldown', muscle: 'ظهر', description: 'يستهدف عضلات الظهر العريضة', difficulty: 'beginner', equipment: ['جهاز سحب'] },
    { id: 'back-3', name: 'تجديف بالبار', nameEn: 'Barbell Row', muscle: 'ظهر', description: 'تمرين أساسي لسمك الظهر', difficulty: 'intermediate', equipment: ['بار'] },
    { id: 'back-4', name: 'تجديف بالدمبل', nameEn: 'Dumbbell Row', muscle: 'ظهر', description: 'تمرين أحادي الجانب للظهر', difficulty: 'beginner', equipment: ['دمبل', 'بنش'] },
    { id: 'back-5', name: 'عقلة', nameEn: 'Pull-ups', muscle: 'ظهر', description: 'تمرين وزن الجسم للظهر العلوي', difficulty: 'advanced', equipment: ['عقلة'] },
    { id: 'back-6', name: 'سحب أرضي بالكابل', nameEn: 'Seated Cable Row', muscle: 'ظهر', description: 'تمرين عزل لوسط الظهر', difficulty: 'beginner', equipment: ['كابل'] },
    { id: 'back-7', name: 'تجديف T-bar', nameEn: 'T-Bar Row', muscle: 'ظهر', description: 'يستهدف منتصف الظهر والعضلات المعينية.', difficulty: 'intermediate', equipment: ['T-bar'] },
    { id: 'back-8', name: 'سحب مستقيم الذراع', nameEn: 'Straight-Arm Pulldown', muscle: 'ظهر', description: 'تمرين عزل لعضلات الظهر العريضة.', difficulty: 'beginner', equipment: ['كابل'] },
    { id: 'back-9', name: 'تمرين سوبرمان', nameEn: 'Superman', muscle: 'ظهر', description: 'يقوي أسفل الظهر والأرداف بوزن الجسم.', difficulty: 'beginner', equipment: [] },
    { id: 'back-10', name: 'رفعة جود مورنينج', nameEn: 'Good Mornings', muscle: 'ظهر', description: 'يقوي أوتار الركبة والأرداف وأسفل الظهر.', difficulty: 'advanced', equipment: ['بار'] },
    { id: 'back-11', 'name': 'عقلة قبضة عكسية (Chin-ups)', 'nameEn': 'Chin-ups', 'muscle': 'ظهر', 'description': 'يركز على عضلات الظهر العريضة والبايسبس.', 'difficulty': 'intermediate', 'equipment': ['عقلة'] },
    { id: 'back-12', 'name': 'تجديف بندلي', 'nameEn': 'Pendlay Row', 'muscle': 'ظهر', 'description': 'نسخة متفجرة من تجديف البار لزيادة القوة.', 'difficulty': 'advanced', 'equipment': ['بار'] },
  ],
  'أكتاف': [
    { id: 'shoulders-1', name: 'ضغط الكتف بالبار', nameEn: 'Military Press', muscle: 'أكتاف', description: 'تمرين أساسي للأكتاف الأمامية', difficulty: 'beginner', equipment: ['بار'] },
    { id: 'shoulders-2', name: 'رفرفة جانبي بالدمبل', nameEn: 'Lateral Raises', muscle: 'أكتاف', description: 'يستهدف الكتف الجانبي', difficulty: 'beginner', equipment: ['دمبل'] },
    { id: 'shoulders-3', name: 'رفرفة خلفي بالدمبل', nameEn: 'Rear Delt Flyes', muscle: 'أكتاف', description: 'يستهدف الكتف الخلفي', difficulty: 'intermediate', equipment: ['دمبل'] },
    { id: 'shoulders-4', name: 'ضغط أرنولد', nameEn: 'Arnold Press', muscle: 'أكتاف', description: 'تمرين شامل للأكتاف', difficulty: 'intermediate', equipment: ['دمبل'] },
    { id: 'shoulders-5', name: 'رفع أمامي بالبار', nameEn: 'Front Raise', muscle: 'أكتاف', description: 'يستهدف الكتف الأمامي', difficulty: 'beginner', equipment: ['بار', 'دمبل'] },
    { id: 'shoulders-6', 'name': 'رفع الوجه بالكابل', 'nameEn': 'Face Pulls', 'muscle': 'أكتاف', 'description': 'ممتاز لصحة الكتف الخلفي وأعلى الظهر.', 'difficulty': 'beginner', 'equipment': ['كابل'] },
    { id: 'shoulders-7', 'name': 'ضغط كتف بالآلة', 'nameEn': 'Machine Shoulder Press', 'muscle': 'أكتاف', 'description': 'بديل آمن ومستقر للضغط الحر.', 'difficulty': 'beginner', 'equipment': ['آلة'] },
    { id: 'shoulders-8', 'name': 'رفع جانبي بالكابل', 'nameEn': 'Cable Lateral Raise', 'muscle': 'أكتاف', 'description': 'يوفر توترًا مستمرًا على الكتف الجانبي.', 'difficulty': 'intermediate', 'equipment': ['كابل'] },
    { id: 'shoulders-9', 'name': 'رفع عالي بالبار', 'nameEn': 'Upright Row', 'muscle': 'أكتاف', 'description': 'يستهدف الأكتاف والعضلات شبه المنحرفة.', 'difficulty': 'intermediate', 'equipment': ['بار', 'دمبل'] },
    { id: 'shoulders-10', 'name': 'ضغط بايك', 'nameEn': 'Pike Press', 'muscle': 'أكتاف', 'description': 'تمرين وزن الجسم للتحضير للوقوف على اليدين.', 'difficulty': 'advanced', 'equipment': [] },
    { id: 'shoulders-11', 'name': 'هز الكتفين بالبار', 'nameEn': 'Barbell Shrugs', 'muscle': 'أكتاف', 'description': 'يستهدف العضلات شبه المنحرفة العلوية.', 'difficulty': 'beginner', 'equipment': ['بار', 'دمبل'] },
  ],
  'أرجل': [
    { id: 'legs-1', name: 'القرفصاء بالبار', nameEn: 'Barbell Squat', muscle: 'أرجل', description: 'ملك تمارين الأرجل', difficulty: 'intermediate', equipment: ['بار', 'رف القرفصاء'] },
    { id: 'legs-2', name: 'ضغط الرجل', nameEn: 'Leg Press', muscle: 'أرجل', description: 'تمرين آمن للفخذين', difficulty: 'beginner', equipment: ['جهاز ضغط الرجل'] },
    { id: 'legs-3', name: 'طعنات بالدمبل', nameEn: 'Dumbbell Lunges', muscle: 'أرجل', description: 'تمرين أحادي الجانب للأرجل', difficulty: 'beginner', equipment: ['دمبل'] },
    { id: 'legs-4', name: 'رفع السمانة واقفاً', nameEn: 'Standing Calf Raise', muscle: 'أرجل', description: 'يستهدف عضلة السمانة', difficulty: 'beginner', equipment: ['جهاز السمانة'] },
    { id: 'legs-5', name: 'تمديد الرجل', nameEn: 'Leg Extension', muscle: 'أرجل', description: 'عزل للعضلة الرباعية', difficulty: 'beginner', equipment: ['جهاز تمديد الرجل'] },
    { id: 'legs-6', name: 'ثني الرجل', nameEn: 'Leg Curl', muscle: 'أرجل', description: 'عزل للعضلة الخلفية', difficulty: 'beginner', equipment: ['جهاز ثني الرجل'] },
    { id: 'legs-7', 'name': 'قرفصاء بلغاري', 'nameEn': 'Bulgarian Split Squat', 'muscle': 'أرجل', 'description': 'تمرين أحادي الجانب ممتاز للفخذين والأرداف.', 'difficulty': 'intermediate', 'equipment': ['دمبل', 'بنش'] },
    { id: 'legs-8', 'name': 'رفعة رومانية مميتة', 'nameEn': 'Romanian Deadlift', 'muscle': 'أرجل', 'description': 'يستهدف أوتار الركبة والأرداف.', 'difficulty': 'intermediate', 'equipment': ['بار', 'دمبل'] },
    { id: 'legs-9', 'name': 'قرفصاء جوبلت', 'nameEn': 'Goblet Squat', 'muscle': 'أرجل', 'description': 'نسخة قرفصاء صديقة للمبتدئين.', 'difficulty': 'beginner', 'equipment': ['دمبل', 'كرة حديدية'] },
    { id: 'legs-10', 'name': 'دفع الورك', 'nameEn': 'Hip Thrust', 'muscle': 'أرجل', 'description': 'أفضل تمرين لبناء عضلات الأرداف.', 'difficulty': 'intermediate', 'equipment': ['بار', 'بنش'] },
    { id: 'legs-11', 'name': 'رفع السمانة جالسًا', 'nameEn': 'Seated Calf Raise', 'muscle': 'أرجل', 'description': 'يستهدف عضلة النعل (soleus) في السمانة.', 'difficulty': 'beginner', 'equipment': ['آلة'] },
    { id: 'legs-12', 'name': 'قرفصاء أمامي', 'nameEn': 'Front Squat', 'muscle': 'أرجل', 'description': 'يركز بشكل أكبر على عضلات الفخذ الرباعية.', 'difficulty': 'advanced', 'equipment': ['بار'] },
  ],
  'بايسبس': [
    { id: 'biceps-1', name: 'تبديل بالدمبل', nameEn: 'Alternating Dumbbell Curl', muscle: 'بايسبس', description: 'تمرين كلاسيكي للبايسبس', difficulty: 'beginner', equipment: ['دمبل'] },
    { id: 'biceps-2', name: 'تبديل بالبار', nameEn: 'Barbell Curl', muscle: 'بايسبس', description: 'تمرين أساسي للبايسبس', difficulty: 'beginner', equipment: ['بار'] },
    { id: 'biceps-3', name: 'تبديل مطرقة', nameEn: 'Hammer Curl', muscle: 'بايسبس', description: 'يستهدف البايسبس والساعد', difficulty: 'beginner', equipment: ['دمبل'] },
    { id: 'biceps-4', name: 'تبديل على البنش المائل', nameEn: 'Incline Dumbbell Curl', muscle: 'بايسبس', description: 'يستهدف الرأس الطويل للبايسبس', difficulty: 'intermediate', equipment: ['دمبل', 'بنش مائل'] },
    { id: 'biceps-5', name: 'تبديل بالكابل', nameEn: 'Cable Curl', muscle: 'بايسبس', description: 'توتر مستمر على البايسبس', difficulty: 'beginner', equipment: ['كابل'] },
    { id: 'biceps-6', 'name': 'تبديل بريتشر', 'nameEn': 'Preacher Curl', 'muscle': 'بايسبس', 'description': 'يعزل قمة البايسبس.', 'difficulty': 'intermediate', 'equipment': ['بنش بريتشر', 'بار EZ'] },
    { id: 'biceps-7', 'name': 'تبديل عكسي', 'nameEn': 'Reverse Curl', 'muscle': 'بايسبس', 'description': 'يقوي العضدية والساعدين.', 'difficulty': 'beginner', 'equipment': ['بار', 'دمبل'] },
    { id: 'biceps-8', 'name': 'تبديل سبايدر', 'nameEn': 'Spider Curl', 'muscle': 'بايسبس', 'description': 'يعزل البايسبس في نطاق حركة قصير.', 'difficulty': 'advanced', 'equipment': ['بنش مائل', 'دمبل'] },
    { id: 'biceps-9', 'name': 'تبديل تركيز', 'nameEn': 'Concentration Curl', 'muscle': 'بايسبس', 'description': 'تمرين عزل كلاسيكي لقمة البايسبس.', 'difficulty': 'beginner', 'equipment': ['دمبل'] },
  ],
  'ترايسبس': [
    { id: 'triceps-1', name: 'ضغط فرنسي بالبار', nameEn: 'Skull Crushers', muscle: 'ترايسبس', description: 'تمرين عزل للترايسبس', difficulty: 'intermediate', equipment: ['بار', 'بنش'] },
    { id: 'triceps-2', name: 'سحب الكابل للأسفل', nameEn: 'Tricep Pushdown', muscle: 'ترايسبس', description: 'تمرين عزل بالكابل', difficulty: 'beginner', equipment: ['كابل'] },
    { id: 'triceps-3', name: 'تمديد الترايسبس بالدمبل', nameEn: 'Overhead Dumbbell Extension', muscle: 'ترايسبس', description: 'يستهدف الرأس الطويل للترايسبس', difficulty: 'beginner', equipment: ['دمبل'] },
    { id: 'triceps-4', name: 'ضغط ضيق', nameEn: 'Close Grip Bench Press', muscle: 'ترايسبس', description: 'تمرين مركب للترايسبس', difficulty: 'intermediate', equipment: ['بار', 'بنش'] },
    { id: 'triceps-5', name: 'تمديد الترايسبس بالكابل', nameEn: 'Cable Overhead Extension', muscle: 'ترايسبس', description: 'توتر مستمر على الترايسبس', difficulty: 'beginner', equipment: ['كابل'] },
    { id: 'triceps-6', 'name': 'غطس على البنش', 'nameEn': 'Bench Dips', 'muscle': 'ترايسبس', 'description': 'تمرين وزن الجسم يمكن القيام به في أي مكان.', 'difficulty': 'beginner', 'equipment': ['بنش'] },
    { id: 'triceps-7', 'name': 'رفسة الترايسبس', 'nameEn': 'Tricep Kickbacks', 'muscle': 'ترايسبس', 'description': 'تمرين عزل جيد لنحت الترايسبس.', 'difficulty': 'beginner', 'equipment': ['دمبل'] },
    { id: 'triceps-8', 'name': 'سحب الكابل بحبل', 'nameEn': 'Rope Tricep Pushdown', 'muscle': 'ترايسبس', 'description': 'يسمح بنطاق حركة أكبر من البار.', 'difficulty': 'beginner', 'equipment': ['كابل', 'حبل'] },
  ],
  'بطن': [
    { id: 'abs-1', name: 'كرانش', nameEn: 'Crunches', muscle: 'بطن', description: 'تمرين أساسي للبطن العلوي', difficulty: 'beginner', equipment: [] },
    { id: 'abs-2', name: 'بلانك', nameEn: 'Plank', muscle: 'بطن', description: 'تمرين ثبات للبطن الكامل', difficulty: 'beginner', equipment: [] },
    { id: 'abs-3', name: 'رفع الأرجل المعلق', nameEn: 'Hanging Leg Raises', muscle: 'بطن', description: 'يستهدف البطن السفلي', difficulty: 'advanced', equipment: ['عقلة'] },
    { id: 'abs-4', name: 'دراجة هوائية', nameEn: 'Bicycle Crunches', muscle: 'بطن', description: 'يستهدف البطن والجوانب', difficulty: 'beginner', equipment: [] },
    { id: 'abs-5', name: 'لف روسي', nameEn: 'Russian Twists', muscle: 'بطن', description: 'يستهدف عضلات الجوانب', difficulty: 'intermediate', equipment: ['دمبل', 'كرة طبية'] },
    { id: 'abs-6', name: 'رفع الأرجل على الأرض', nameEn: 'Leg Raises', muscle: 'بطن', description: 'يستهدف البطن السفلي', difficulty: 'intermediate', equipment: [] },
    { id: 'abs-7', 'name': 'كرانش بالكابل', 'nameEn': 'Cable Crunches', 'muscle': 'بطن', 'description': 'يسمح بإضافة مقاومة لتمارين البطن.', 'difficulty': 'intermediate', 'equipment': ['كابل'] },
    { id: 'abs-8', 'name': 'بلانك جانبي', 'nameEn': 'Side Plank', 'muscle': 'بطن', 'description': 'يقوي عضلات البطن الجانبية.', 'difficulty': 'beginner', 'equipment': [] },
    { id: 'abs-9', 'name': 'تمرين قاطع الخشب', 'nameEn': 'Woodchoppers', 'muscle': 'بطن', 'description': 'تمرين دوراني وظيفي لكامل الجذع.', 'difficulty': 'intermediate', 'equipment': ['كابل', 'دمبل'] },
    { id: 'abs-10', 'name': 'تمرين العجلة', 'nameEn': 'Ab Rollout', 'muscle': 'بطن', 'description': 'تمرين متقدم يتحدى استقرار الجذع.', 'difficulty': 'advanced', 'equipment': ['عجلة البطن'] },
  ],
  'ساعد': [
    { id: 'forearms-1', name: 'لف المعصم بالبار', nameEn: 'Wrist Curls', muscle: 'ساعد', description: 'يستهدف عضلات الساعد الأمامية', difficulty: 'beginner', equipment: ['بار', 'دمبل'] },
    { id: 'forearms-2', name: 'لف المعصم العكسي', nameEn: 'Reverse Wrist Curls', muscle: 'ساعد', description: 'يستهدف عضلات الساعد الخلفية', difficulty: 'beginner', equipment: ['بار', 'دمبل'] },
    { id: 'forearms-3', name: 'مسك المزارع', nameEn: "Farmer's Walk", muscle: 'ساعد', description: 'تمرين قوة القبضة وكامل الجسم', difficulty: 'beginner', equipment: ['دمبل', 'كرة حديدية'] },
    { id: 'forearms-4', 'name': 'لفافة المعصم', 'nameEn': 'Wrist Roller', 'muscle': 'ساعد', 'description': 'تمرين كلاسيكي لزيادة قدرة تحمل الساعد.', 'difficulty': 'intermediate', 'equipment': ['لفافة معصم'] },
  ],
  'كارديو': [
    { id: 'cardio-1', 'name': 'الجري', 'nameEn': 'Running', 'muscle': 'كارديو', 'description': 'تمرين كلاسيكي لصحة القلب والأوعية الدموية.', 'difficulty': 'beginner', 'equipment': [] },
    { id: 'cardio-2', 'name': 'نط الحبل', 'nameEn': 'Jumping Rope', 'muscle': 'كارديو', 'description': 'تمرين عالي الكثافة لكامل الجسم.', 'difficulty': 'beginner', 'equipment': ['حبل قفز'] },
    { id: 'cardio-3', 'name': 'ركوب الدراجة', 'nameEn': 'Cycling', 'muscle': 'كارديو', 'description': 'تمرين منخفض التأثير على المفاصل.', 'difficulty': 'beginner', 'equipment': ['دراجة ثابتة'] },
    { id: 'cardio-4', 'name': 'السباحة', 'nameEn': 'Swimming', 'muscle': 'كارديو', 'description': 'تمرين لكامل الجسم بدون تأثير على المفاصل.', 'difficulty': 'intermediate', 'equipment': ['مسبح'] },
    { id: 'cardio-5', 'name': 'صعود السلم', 'nameEn': 'Stair Climbing', 'muscle': 'كارديو', 'description': 'تمرين فعال لحرق السعرات الحرارية.', 'difficulty': 'beginner', 'equipment': ['جهاز صعود السلم'] },
    { id: 'cardio-6', 'name': 'التجديف', 'nameEn': 'Rowing', 'muscle': 'كارديو', 'description': 'تمرين لكامل الجسم يجمع بين القوة والتحمل.', 'difficulty': 'intermediate', 'equipment': ['آلة تجديف'] },
    { id: 'cardio-7', 'name': 'قفز الرافعات', 'nameEn': 'Jumping Jacks', 'muscle': 'كارديو', 'description': 'تمرين إحماء بسيط وفعال.', 'difficulty': 'beginner', 'equipment': [] },
    { id: 'cardio-8', 'name': 'بيربيز', 'nameEn': 'Burpees', 'muscle': 'كارديو', 'description': 'تمرين لكامل الجسم يتحدى القوة والتحمل.', 'difficulty': 'advanced', 'equipment': [] },
    { id: 'cardio-9', 'name': 'متسلقو الجبال', 'nameEn': 'Mountain Climbers', 'muscle': 'كارديو', 'description': 'تمرين لتقوية الجذع ورفع معدل ضربات القلب.', 'difficulty': 'beginner', 'equipment': [] },
  ],
};

export const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    'beginner': 'مبتدئ',
    'intermediate': 'متوسط',
    'advanced': 'متقدم',
  };
  return labels[difficulty] || difficulty;
};

export const getEquipmentLabel = (equipment: string[]): string => {
  if (equipment.length === 0) return 'وزن الجسم';
  return equipment.join(' • ');
};