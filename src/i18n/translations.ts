/**
 * Bilingual content dictionary.
 *
 * All user-facing strings live here so a future Admin Dashboard can replace
 * this module with data fetched from the backend without touching components.
 * Every entry is a placeholder describing the content that will be published.
 */

export type Language = "ar" | "en";

export type LocalizedText = Record<Language, string>;

export const t = <T extends LocalizedText>(entry: T, lang: Language) => entry[lang];

export const site = {
  villageName: { ar: "قرية [اسم القرية]", en: "[Village Name]" },
  villageTagline: {
    ar: "قضاء [اسم القضاء] · فلسطين · ما قبل عام ١٩٤٨",
    en: "[District] District · Palestine · Before 1948",
  },
  associationName: {
    ar: "جمعية أهالي القرية للتراث والذاكرة",
    en: "Village Heritage & Memory Association",
  },
  heroIntro: {
    ar: "مساحة أرشيفية تجمع صور القرية ووثائقها وشهادات أهلها قبل عام ١٩٤٨. سيُستبدل هذا النص بمقدمة تعريفية يكتبها فريق الأرشيف.",
    en: "An archival space gathering the village's photographs, documents and testimonies from before 1948. This text will be replaced by an introduction written by the archive team.",
  },
  heroCta: { ar: "ابدأ الزيارة", en: "Begin the visit" },
  heroCtaSecondary: { ar: "تصفّح الأرشيف", en: "Browse the archive" },
  scrollHint: { ar: "انزل للأسفل", en: "Scroll" },
  langLabel: { ar: "اللغة", en: "Language" },
  menu: { ar: "القائمة", en: "Menu" },
  viewAll: { ar: "عرض الكل", en: "View all" },
  placeholderBadge: { ar: "محتوى مؤقت", en: "Placeholder" },
} satisfies Record<string, LocalizedText>;

export const nav = [
  { id: "welcome", ar: "كلمة الجمعية", en: "Welcome" },
  { id: "history", ar: "تاريخ القرية", en: "History" },
  { id: "news", ar: "الأخبار", en: "News" },
  { id: "events", ar: "الفعاليات", en: "Events" },
  { id: "gallery", ar: "المعرض", en: "Gallery" },
  { id: "stories", ar: "روايات الزوار", en: "Stories" },
  { id: "location", ar: "الموقع", en: "Location" },
] as const;

export const sections = {
  welcome: {
    eyebrow: { ar: "كلمة الجمعية", en: "A word from the association" },
    title: { ar: "أهلاً بكم في ذاكرة القرية", en: "Welcome to the village's memory" },
    body: {
      ar: "هنا ستُنشر كلمة رئيس الجمعية: تعريف بالهدف من الأرشيف، ودعوة لأبناء القرية وأحفادهم للمساهمة بالصور والوثائق والروايات الشفوية. النص الحالي مؤقت ويُدار لاحقاً من لوحة التحكم.",
      en: "The association chairperson's message will be published here: the purpose of the archive, and an invitation to the village's descendants to contribute photographs, documents and oral testimonies. This text is a placeholder, later managed from the admin dashboard.",
    },
    signatureName: { ar: "[اسم رئيس الجمعية]", en: "[Chairperson name]" },
    signatureRole: { ar: "رئيس الجمعية", en: "Chairperson of the association" },
  },
  history: {
    eyebrow: { ar: "تاريخ القرية", en: "Village history" },
    title: { ar: "حجرٌ وزيتون وذاكرة", en: "Stone, olive and memory" },
    body: {
      ar: "سيتضمن هذا القسم سرداً تاريخياً موثقاً لنشأة القرية، وعمارتها الحجرية، وأراضيها الزراعية، وعائلاتها، وحياتها اليومية حتى عام ١٩٤٨. النص أدناه وصفٌ للمحتوى القادم.",
      en: "This section will hold a documented history of the village's founding, its stone architecture, agricultural lands, families and daily life up to 1948. The text below describes the content to come.",
    },
    timeline: [
      {
        period: { ar: "النشأة", en: "Founding" },
        title: { ar: "أصل القرية وموقعها", en: "Origins and setting" },
        body: {
          ar: "مكان لسرد أقدم الإشارات التاريخية للقرية، وموقعها على السفح، ومصادر مياهها.",
          en: "A place for the earliest historical references to the village, its hillside setting and water sources.",
        },
      },
      {
        period: { ar: "العمارة", en: "Architecture" },
        title: { ar: "البيوت الحجرية والعقود", en: "Stone houses and arches" },
        body: {
          ar: "وصف لطراز البناء بالحجر الجيري، والعقود المتقاطعة، والأحواش المشتركة بين العائلات.",
          en: "A description of limestone construction, cross-vaulted rooms and the shared courtyards between families.",
        },
      },
      {
        period: { ar: "الأرض", en: "The land" },
        title: { ar: "الزيتون والمواسم", en: "Olives and the seasons" },
        body: {
          ar: "مساحة لتوثيق مساحات الأرض، ومواسم الزيتون والحصاد، والمعاصر القديمة.",
          en: "Space to document the village lands, the olive and harvest seasons, and the old presses.",
        },
      },
      {
        period: { ar: "١٩٤٨", en: "1948" },
        title: { ar: "الرحيل والذاكرة", en: "Departure and remembrance" },
        body: {
          ar: "هنا تُوثَّق أحداث عام ١٩٤٨ كما رواها الشهود، وأسماء العائلات وأماكن لجوئها.",
          en: "Here the events of 1948 will be documented as told by witnesses, with family names and places of refuge.",
        },
      },
    ],
  },
  news: {
    eyebrow: { ar: "آخر الأخبار", en: "Latest news" },
    title: { ar: "من أنشطة الجمعية", en: "From the association" },
    body: {
      ar: "ستظهر هنا آخر ثلاثة أخبار منشورة من لوحة التحكم.",
      en: "The three most recent news items published from the dashboard will appear here.",
    },
    items: [
      {
        date: { ar: "التاريخ", en: "Date" },
        title: { ar: "عنوان الخبر الأول", en: "First news headline" },
        body: {
          ar: "ملخص قصير للخبر: إعلانات الجمعية، إصدارات أرشيفية جديدة، أو نتائج جمع الوثائق.",
          en: "A short summary: association announcements, newly released archive material, or results of document collection.",
        },
      },
      {
        date: { ar: "التاريخ", en: "Date" },
        title: { ar: "عنوان الخبر الثاني", en: "Second news headline" },
        body: {
          ar: "ملخص قصير للخبر يُدار لاحقاً من لوحة التحكم.",
          en: "A short summary, later managed from the admin dashboard.",
        },
      },
      {
        date: { ar: "التاريخ", en: "Date" },
        title: { ar: "عنوان الخبر الثالث", en: "Third news headline" },
        body: {
          ar: "ملخص قصير للخبر يُدار لاحقاً من لوحة التحكم.",
          en: "A short summary, later managed from the admin dashboard.",
        },
      },
    ],
  },
  events: {
    eyebrow: { ar: "الفعاليات القادمة", en: "Upcoming events" },
    title: { ar: "مواعيد اللقاء", en: "Gatherings to come" },
    body: {
      ar: "ستُدرج هنا الفعاليات القادمة: لقاءات الأهالي، أمسيات الرواية الشفوية، ومعارض الصور.",
      en: "Upcoming events will be listed here: family gatherings, oral history evenings and photography exhibitions.",
    },
    items: [
      {
        day: { ar: "--", en: "--" },
        month: { ar: "الشهر", en: "Month" },
        title: { ar: "عنوان الفعالية الأولى", en: "First event title" },
        place: { ar: "[المكان]", en: "[Venue]" },
        body: {
          ar: "وصف مختصر للفعالية وبرنامجها وطريقة التسجيل.",
          en: "A brief description of the event, its programme and how to register.",
        },
      },
      {
        day: { ar: "--", en: "--" },
        month: { ar: "الشهر", en: "Month" },
        title: { ar: "عنوان الفعالية الثانية", en: "Second event title" },
        place: { ar: "[المكان]", en: "[Venue]" },
        body: {
          ar: "وصف مختصر للفعالية وبرنامجها وطريقة التسجيل.",
          en: "A brief description of the event, its programme and how to register.",
        },
      },
      {
        day: { ar: "--", en: "--" },
        month: { ar: "الشهر", en: "Month" },
        title: { ar: "عنوان الفعالية الثالثة", en: "Third event title" },
        place: { ar: "[المكان]", en: "[Venue]" },
        body: {
          ar: "وصف مختصر للفعالية وبرنامجها وطريقة التسجيل.",
          en: "A brief description of the event, its programme and how to register.",
        },
      },
    ],
  },
  gallery: {
    eyebrow: { ar: "المعرض", en: "Gallery" },
    title: { ar: "صور من الأرشيف", en: "Images from the archive" },
    body: {
      ar: "معاينة من أرشيف الصور. ستُستبدل هذه الصور بصور القرية الأصلية بعد رفعها من لوحة التحكم.",
      en: "A preview of the photographic archive. These images will be replaced by original village photographs uploaded through the dashboard.",
    },
    captionPlaceholder: { ar: "[وصف الصورة وتاريخها ومصدرها]", en: "[Caption, date and source]" },
  },
  stories: {
    eyebrow: { ar: "روايات الزوار", en: "Visitor stories" },
    title: { ar: "شهادات وذكريات", en: "Testimonies and memories" },
    body: {
      ar: "مساحة لنشر روايات أبناء القرية وزوار الموقع. ستُراجع المساهمات قبل نشرها.",
      en: "A space for the testimonies of the village's descendants and site visitors. Contributions will be reviewed before publication.",
    },
    items: [
      {
        quote: {
          ar: "«مكان لاقتباس من رواية شفوية يرويها أحد أبناء القرية عن بيتها أو أرضها أو موسم الزيتون.»",
          en: "\u201cSpace for a quotation from an oral testimony about a house, a field, or the olive harvest.\u201d",
        },
        name: { ar: "[اسم الراوي]", en: "[Narrator name]" },
        meta: { ar: "[الجيل / مكان الإقامة]", en: "[Generation / place of residence]" },
      },
      {
        quote: {
          ar: "«مكان لاقتباس ثانٍ من شهادة موثّقة، مع الإشارة إلى تاريخ التسجيل ومصدره.»",
          en: "\u201cSpace for a second quotation from a documented testimony, with its recording date and source.\u201d",
        },
        name: { ar: "[اسم الراوي]", en: "[Narrator name]" },
        meta: { ar: "[الجيل / مكان الإقامة]", en: "[Generation / place of residence]" },
      },
    ],
    cta: { ar: "شارك روايتك", en: "Share your story" },
  },
  location: {
    eyebrow: { ar: "الموقع", en: "Location" },
    title: { ar: "أين كانت القرية", en: "Where the village stood" },
    body: {
      ar: "ستُعرض هنا خريطة تفاعلية لموقع القرية وحدود أراضيها والقرى المجاورة، مع مرجعية الخرائط التاريخية.",
      en: "An interactive map of the village site, its land boundaries and neighbouring villages will be displayed here, referenced against historical maps.",
    },
    facts: [
      { label: { ar: "القضاء", en: "District" }, value: { ar: "[اسم القضاء]", en: "[District name]" } },
      { label: { ar: "الارتفاع", en: "Elevation" }, value: { ar: "[--- م]", en: "[--- m]" } },
      { label: { ar: "مساحة الأرض", en: "Land area" }, value: { ar: "[--- دونم]", en: "[--- dunams]" } },
      { label: { ar: "عدد السكان ١٩٤٥", en: "Population 1945" }, value: { ar: "[---]", en: "[---]" } },
    ],
    mapNote: {
      ar: "معاينة خريطة تاريخية — ستُربط بخريطة تفاعلية لاحقاً.",
      en: "Historical map preview \u2014 to be connected to an interactive map.",
    },
  },
  footer: {
    about: {
      ar: "أرشيف رقمي غير ربحي تديره جمعية أهالي القرية لحفظ الذاكرة والتراث.",
      en: "A non-profit digital archive maintained by the village association to preserve memory and heritage.",
    },
    contactTitle: { ar: "تواصل معنا", en: "Contact" },
    email: { ar: "[البريد الإلكتروني]", en: "[Email address]" },
    phone: { ar: "[رقم الهاتف]", en: "[Phone number]" },
    address: { ar: "[عنوان مقر الجمعية]", en: "[Association address]" },
    linksTitle: { ar: "أقسام الموقع", en: "Sections" },
    contributeTitle: { ar: "ساهم في الأرشيف", en: "Contribute" },
    contributeBody: {
      ar: "إن كنت تملك صوراً أو وثائق أو تسجيلات عن القرية، يسعدنا استقبالها وتوثيقها باسمك.",
      en: "If you hold photographs, documents or recordings of the village, we would be honoured to document them in your name.",
    },
    rights: {
      ar: "جميع الحقوق محفوظة لجمعية أهالي القرية.",
      en: "All rights reserved to the village association.",
    },
    adminLink: { ar: "دخول الإدارة", en: "Admin access" },
  },
} as const;
