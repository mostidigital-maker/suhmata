/**
 * Bilingual strings for the archive platform pages (gallery, events,
 * articles, archive, map, contributions). Kept separate from the home-page
 * dictionary so each surface stays easy to maintain.
 */
import type { LocalizedText } from "./translations";

export type NavItem = {
  id: string;
  to: string;
  hash?: string;
  label: LocalizedText;
};

export const mainNav: NavItem[] = [
  { id: "home", to: "/", label: { ar: "الرئيسية", en: "Home" } },
  { id: "history", to: "/", hash: "history", label: { ar: "تاريخ القرية", en: "History" } },
  { id: "articles", to: "/articles", label: { ar: "المقالات", en: "Articles" } },
  { id: "events", to: "/events", label: { ar: "الفعاليات", en: "Events" } },
  { id: "gallery", to: "/gallery", label: { ar: "المعرض", en: "Gallery" } },
  { id: "archive", to: "/archive", label: { ar: "الأرشيف", en: "Archive" } },
  { id: "map", to: "/map", label: { ar: "الخريطة", en: "Map" } },
  { id: "contribute", to: "/contribute", label: { ar: "شارك", en: "Contribute" } },
];

export const ui = {
  loading: { ar: "جارٍ التحميل…", en: "Loading…" },
  empty: { ar: "لا يوجد محتوى منشور بعد.", en: "No published content yet." },
  back: { ar: "رجوع", en: "Back" },
  all: { ar: "الكل", en: "All" },
  search: { ar: "ابحث…", en: "Search…" },
  share: { ar: "مشاركة", en: "Share" },
  copyLink: { ar: "نسخ الرابط", en: "Copy link" },
  linkCopied: { ar: "تم نسخ الرابط", en: "Link copied" },
  readingTime: { ar: "دقائق قراءة", en: "min read" },
  download: { ar: "تحميل", en: "Download" },
  close: { ar: "إغلاق", en: "Close" },
  previous: { ar: "السابق", en: "Previous" },
  next: { ar: "التالي", en: "Next" },
  zoomIn: { ar: "تكبير", en: "Zoom in" },
  zoomOut: { ar: "تصغير", en: "Zoom out" },
  loadMore: { ar: "تحميل المزيد", en: "Load more" },
  pending: {
    ar: "شكراً لك — ستُراجع مساهمتك قبل نشرها.",
    en: "Thank you — your contribution will be reviewed before publication.",
  },
  submit: { ar: "إرسال", en: "Submit" },
  optional: { ar: "اختياري", en: "optional" },
} satisfies Record<string, LocalizedText>;

export const galleryPage = {
  eyebrow: { ar: "المعرض", en: "Gallery" },
  title: { ar: "ألبومات الصور", en: "Photo albums" },
  body: {
    ar: "ألبومات مصنّفة من أرشيف القرية: البيوت الحجرية، مواسم الزيتون، وجوه الأهالي والوثائق المصوّرة.",
    en: "Curated albums from the village archive: stone houses, olive seasons, faces of the people and photographed documents.",
  },
  itemCount: { ar: "صورة", en: "items" },
  openAlbum: { ar: "افتح الألبوم", en: "Open album" },
} satisfies Record<string, LocalizedText>;

export const eventsPage = {
  eyebrow: { ar: "الفعاليات", en: "Events" },
  title: { ar: "لقاءات الذاكرة", en: "Gatherings of memory" },
  body: {
    ar: "الفعاليات القادمة وأرشيف الفعاليات السابقة مع صورها وملخّصاتها.",
    en: "Upcoming events and the archive of past gatherings with their photographs and summaries.",
  },
  upcoming: { ar: "فعاليات قادمة", en: "Upcoming" },
  past: { ar: "أرشيف الفعاليات", en: "Past events archive" },
  summary: { ar: "ملخّص الفعالية", en: "Event summary" },
  photos: { ar: "صور الفعالية", en: "Event photos" },
  videos: { ar: "فيديوهات الفعالية", en: "Event videos" },
  noUpcoming: { ar: "لا توجد فعاليات قادمة حالياً.", en: "No upcoming events at the moment." },
} satisfies Record<string, LocalizedText>;

export const articlesPage = {
  eyebrow: { ar: "المقالات", en: "Articles" },
  title: { ar: "من دفاتر الأرشيف", en: "From the archive notebooks" },
  body: {
    ar: "مقالات وأبحاث ونصوص توثيقية عن القرية وأهلها، مع بحث وتصنيفات.",
    en: "Articles, research and documentation about the village and its people, with search and categories.",
  },
  featured: { ar: "مقال مميّز", en: "Featured article" },
  related: { ar: "مقالات ذات صلة", en: "Related articles" },
  noResults: { ar: "لا نتائج مطابقة للبحث.", en: "No articles match your search." },
} satisfies Record<string, LocalizedText>;

export const archivePage = {
  eyebrow: { ar: "الأرشيف التاريخي", en: "Historical archive" },
  title: { ar: "وثائق وخرائط وتسجيلات", en: "Documents, maps and recordings" },
  body: {
    ar: "مواد أرشيفية أصلية: وثائق، خرائط، صور قديمة، تسجيلات صوتية، أفلام وملفات PDF قابلة للتحميل.",
    en: "Original archival material: documents, maps, old photographs, audio recordings, films and downloadable PDFs.",
  },
  kinds: {
    document: { ar: "وثائق", en: "Documents" },
    map: { ar: "خرائط", en: "Maps" },
    photo: { ar: "صور قديمة", en: "Old photos" },
    audio: { ar: "تسجيلات صوتية", en: "Audio" },
    video: { ar: "أفلام", en: "Video" },
    pdf: { ar: "ملفات PDF", en: "PDFs" },
  },
  source: { ar: "المصدر", en: "Source" },
  year: { ar: "السنة", en: "Year" },
};

export const mapPage = {
  eyebrow: { ar: "خريطة القرية", en: "Village map" },
  title: { ar: "خريطة تفاعلية للمعالم", en: "Interactive map of the landmarks" },
  body: {
    ar: "اختر أحد المعالم على الخريطة لقراءة وصفه وملاحظاته التاريخية ومشاهدة صوره: بيوت العائلات، المسجد، المقبرة، المدرسة والآبار.",
    en: "Select a landmark on the map to read its description, historical notes and photographs: family homes, the mosque, the cemetery, the school and the wells.",
  },
  notes: { ar: "ملاحظات تاريخية", en: "Historical notes" },
  landmarks: { ar: "المعالم", en: "Landmarks" },
} satisfies Record<string, LocalizedText>;

export const contributePage = {
  eyebrow: { ar: "مساهمات الزوار", en: "Visitor contributions" },
  title: { ar: "شارك ذاكرتك", en: "Share your memory" },
  body: {
    ar: "أضف رواية أو صورة أو فيديو من ذاكرة القرية. تبقى كل المساهمات قيد المراجعة حتى يوافق عليها فريق الأرشيف.",
    en: "Add a story, a photograph or a video from the village's memory. Every contribution stays pending until the archive team approves it.",
  },
  kinds: {
    story: { ar: "رواية", en: "Story" },
    image: { ar: "صورة", en: "Image" },
    video: { ar: "فيديو", en: "Video" },
  },
  name: { ar: "الاسم", en: "Your name" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  social: { ar: "رابط حساب تواصل", en: "Social link" },
  entryTitle: { ar: "العنوان", en: "Title" },
  story: { ar: "روايتك", en: "Your story" },
  file: { ar: "الملف", en: "File" },
  videoUrl: { ar: "رابط الفيديو", en: "Video link" },
  approved: { ar: "مساهمات منشورة", en: "Published contributions" },
};
