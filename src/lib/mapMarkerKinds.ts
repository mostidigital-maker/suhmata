import {
  Church,
  Droplet,
  Flower2,
  GraduationCap,
  Home,
  Landmark,
  MoonStar,
  type LucideIcon,
} from "lucide-react";

/**
 * One icon per map_locations.kind value, used both on the interactive
 * map markers and in the admin's kind picker. `kind` is free-form text
 * in the database (no CHECK constraint), so an unrecognized value just
 * falls back to the generic Landmark pin instead of failing.
 */
export const MARKER_KINDS = [
  { value: "landmark", labelAr: "معلم", labelEn: "Landmark", icon: Landmark },
  { value: "family_home", labelAr: "بيت عائلة", labelEn: "Family home", icon: Home },
  { value: "mosque", labelAr: "مسجد", labelEn: "Mosque", icon: MoonStar },
  { value: "church", labelAr: "كنيسة", labelEn: "Church", icon: Church },
  { value: "school", labelAr: "مدرسة", labelEn: "School", icon: GraduationCap },
  { value: "cemetery", labelAr: "مقبرة", labelEn: "Cemetery", icon: Flower2 },
  { value: "well", labelAr: "بئر", labelEn: "Well", icon: Droplet },
] as const;

const iconByKind = new Map<string, LucideIcon>(MARKER_KINDS.map((k) => [k.value, k.icon]));

export function getMarkerIcon(kind: string | null | undefined): LucideIcon {
  return (kind && iconByKind.get(kind)) || Landmark;
}
