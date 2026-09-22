import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, ImageUp, Pencil, Save, Trash2, TreeDeciduous, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { inputClass, slugify, uploadImage } from "./adminFormUtils";
import { resolveMediaUrl } from "@/lib/media";

const emptyFamilyMember: TablesInsert<"family_members"> = {
  slug: "",
  family_name_ar: "",
  family_name_en: "",
  full_name_ar: "",
  full_name_en: "",
  gender: null,
  birth_year: "",
  death_year: "",
  notes_ar: "",
  notes_en: "",
  photo: null,
  father_id: null,
  mother_id: null,
  spouse_id: null,
  published: true,
  sort_order: 0,
};

const emptyMemorial: TablesInsert<"memorials"> = {
  slug: "",
  full_name_ar: "",
  full_name_en: "",
  family_member_id: null,
  birth_year: "",
  death_year: "",
  biography_ar: "",
  biography_en: "",
  photo: null,
  published: false,
  sort_order: 0,
};

const emptyCampaign: TablesInsert<"donation_campaigns"> = {
  slug: "",
  title_ar: "",
  title_en: "",
  description_ar: "",
  description_en: "",
  cover_image: null,
  goal_amount: 0,
  raised_amount: 0,
  currency: "ILS",
  starts_at: null,
  ends_at: null,
  active: true,
  sort_order: 0,
};

const emptyPaymentMethod: TablesInsert<"payment_methods"> = {
  slug: "",
  kind: "bank",
  name_ar: "",
  name_en: "",
  instructions_ar: "",
  instructions_en: "",
  account_details: "",
  external_url: "",
  logo: null,
  active: true,
  sort_order: 0,
};

type HeritageManagerProps = {
  /** Same tier as Articles / Map Locations — admin and super_admin. */
  canEditContent: boolean;
};

export function HeritageManager({ canEditContent }: HeritageManagerProps) {
  const queryClient = useQueryClient();

  // ---------------------------------------------------------- family tree
  const [memberForm, setMemberForm] = useState<TablesInsert<"family_members">>(emptyFamilyMember);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const membersQuery = useQuery({
    queryKey: ["admin", "family_members"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .order("family_name_ar", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const uploadMemberPhoto = useMutation({
    mutationFn: (file: File) => uploadImage(file, "family-tree"),
    onSuccess: (url) => {
      setMemberForm((current) => ({ ...current, photo: url }));
      toast.success("Photo uploaded. Save to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMember = useMutation({
    mutationFn: async () => {
      const name = String(memberForm.full_name_en || memberForm.full_name_ar || "member");
      const payload = {
        ...memberForm,
        slug: slugify(String(memberForm.slug || name)) || `member-${Date.now()}`,
      };
      const result = editingMemberId
        ? await supabase.from("family_members").update(payload).eq("id", editingMemberId)
        : await supabase.from("family_members").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setMemberForm(emptyFamilyMember);
      setEditingMemberId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "family_members"] });
      await queryClient.invalidateQueries({ queryKey: ["family_members"] });
      toast.success(editingMemberId ? "Family member updated" : "Family member added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("family_members").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "family_members"] });
      await queryClient.invalidateQueries({ queryKey: ["family_members"] });
      toast.success("Family member deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editMember = (item: Tables<"family_members">) => {
    setEditingMemberId(item.id);
    setMemberForm({
      slug: item.slug,
      family_name_ar: item.family_name_ar,
      family_name_en: item.family_name_en,
      full_name_ar: item.full_name_ar,
      full_name_en: item.full_name_en,
      gender: item.gender,
      birth_year: item.birth_year,
      death_year: item.death_year,
      notes_ar: item.notes_ar,
      notes_en: item.notes_en,
      photo: item.photo,
      father_id: item.father_id,
      mother_id: item.mother_id,
      spouse_id: item.spouse_id,
      published: item.published,
      sort_order: item.sort_order,
    });
    document.getElementById("family-member-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onMemberSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMember.mutate();
  };

  const relativeOptions = (membersQuery.data ?? []).filter((m) => m.id !== editingMemberId);

  // ------------------------------------------------------------ memorials
  const [memorialForm, setMemorialForm] = useState<TablesInsert<"memorials">>(emptyMemorial);
  const [editingMemorialId, setEditingMemorialId] = useState<string | null>(null);

  const memorialsQuery = useQuery({
    queryKey: ["admin", "memorials"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memorials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const uploadMemorialPhoto = useMutation({
    mutationFn: (file: File) => uploadImage(file, "memorials"),
    onSuccess: (url) => {
      setMemorialForm((current) => ({ ...current, photo: url }));
      toast.success("Photo uploaded. Save to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMemorial = useMutation({
    mutationFn: async () => {
      const name = String(memorialForm.full_name_en || memorialForm.full_name_ar || "memorial");
      const payload = {
        ...memorialForm,
        slug: slugify(String(memorialForm.slug || name)) || `memorial-${Date.now()}`,
      };
      const result = editingMemorialId
        ? await supabase.from("memorials").update(payload).eq("id", editingMemorialId)
        : await supabase.from("memorials").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setMemorialForm(emptyMemorial);
      setEditingMemorialId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "memorials"] });
      await queryClient.invalidateQueries({ queryKey: ["memorials"] });
      toast.success(editingMemorialId ? "Memorial updated" : "Memorial added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeMemorial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("memorials").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "memorials"] });
      await queryClient.invalidateQueries({ queryKey: ["memorials"] });
      toast.success("Memorial deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editMemorial = (item: Tables<"memorials">) => {
    setEditingMemorialId(item.id);
    setMemorialForm({
      slug: item.slug,
      full_name_ar: item.full_name_ar,
      full_name_en: item.full_name_en,
      family_member_id: item.family_member_id,
      birth_year: item.birth_year,
      death_year: item.death_year,
      biography_ar: item.biography_ar,
      biography_en: item.biography_en,
      photo: item.photo,
      published: item.published,
      sort_order: item.sort_order,
    });
    document.getElementById("memorial-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onMemorialSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMemorial.mutate();
  };

  // ------------------------------------------------------------ campaigns
  const [campaignForm, setCampaignForm] =
    useState<TablesInsert<"donation_campaigns">>(emptyCampaign);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  const campaignsQuery = useQuery({
    queryKey: ["admin", "donation_campaigns"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_campaigns")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const uploadCampaignCover = useMutation({
    mutationFn: (file: File) => uploadImage(file, "donations"),
    onSuccess: (url) => {
      setCampaignForm((current) => ({ ...current, cover_image: url }));
      toast.success("Image uploaded. Save to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveCampaign = useMutation({
    mutationFn: async () => {
      const title = String(campaignForm.title_en || campaignForm.title_ar || "campaign");
      const payload = {
        ...campaignForm,
        slug: slugify(String(campaignForm.slug || title)) || `campaign-${Date.now()}`,
        goal_amount: Number(campaignForm.goal_amount) || 0,
        raised_amount: Number(campaignForm.raised_amount) || 0,
      };
      const result = editingCampaignId
        ? await supabase.from("donation_campaigns").update(payload).eq("id", editingCampaignId)
        : await supabase.from("donation_campaigns").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setCampaignForm(emptyCampaign);
      setEditingCampaignId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "donation_campaigns"] });
      await queryClient.invalidateQueries({ queryKey: ["donation_campaigns"] });
      toast.success(editingCampaignId ? "Campaign updated" : "Campaign added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("donation_campaigns").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "donation_campaigns"] });
      await queryClient.invalidateQueries({ queryKey: ["donation_campaigns"] });
      toast.success("Campaign deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editCampaign = (item: Tables<"donation_campaigns">) => {
    setEditingCampaignId(item.id);
    setCampaignForm({
      slug: item.slug,
      title_ar: item.title_ar,
      title_en: item.title_en,
      description_ar: item.description_ar,
      description_en: item.description_en,
      cover_image: item.cover_image,
      goal_amount: item.goal_amount,
      raised_amount: item.raised_amount,
      currency: item.currency,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      active: item.active,
      sort_order: item.sort_order,
    });
    document.getElementById("campaign-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onCampaignSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveCampaign.mutate();
  };

  // ------------------------------------------------------- payment methods
  const [methodForm, setMethodForm] = useState<TablesInsert<"payment_methods">>(emptyPaymentMethod);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);

  const methodsQuery = useQuery({
    queryKey: ["admin", "payment_methods"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const uploadMethodLogo = useMutation({
    mutationFn: (file: File) => uploadImage(file, "donations"),
    onSuccess: (url) => {
      setMethodForm((current) => ({ ...current, logo: url }));
      toast.success("Logo uploaded. Save to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMethod = useMutation({
    mutationFn: async () => {
      const name = String(methodForm.name_en || methodForm.name_ar || "method");
      const payload = {
        ...methodForm,
        slug: slugify(String(methodForm.slug || name)) || `method-${Date.now()}`,
      };
      const result = editingMethodId
        ? await supabase.from("payment_methods").update(payload).eq("id", editingMethodId)
        : await supabase.from("payment_methods").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setMethodForm(emptyPaymentMethod);
      setEditingMethodId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "payment_methods"] });
      await queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
      toast.success(editingMethodId ? "Payment method updated" : "Payment method added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_methods").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "payment_methods"] });
      await queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
      toast.success("Payment method deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editMethod = (item: Tables<"payment_methods">) => {
    setEditingMethodId(item.id);
    setMethodForm({
      slug: item.slug,
      kind: item.kind,
      name_ar: item.name_ar,
      name_en: item.name_en,
      instructions_ar: item.instructions_ar,
      instructions_en: item.instructions_en,
      account_details: item.account_details,
      external_url: item.external_url,
      logo: item.logo,
      active: item.active,
      sort_order: item.sort_order,
    });
    document.getElementById("method-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onMethodSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMethod.mutate();
  };

  if (!canEditContent) return null;

  return (
    <>
      {/* ============================================================ FAMILY TREE */}
      <section
        id="family-member-editor"
        className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
      >
        <div className="flex items-center gap-3">
          <TreeDeciduous className="h-5 w-5 text-olive" />
          <div>
            <h2 className="font-display text-2xl font-semibold">
              {editingMemberId ? "تعديل فرد · Edit family member" : "إضافة فرد · Add family member"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Link a father, mother or spouse by selecting them from existing members — add parents
              first, then their children.
            </p>
          </div>
        </div>
        <form onSubmit={onMemberSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            required
            className={inputClass}
            value={memberForm.full_name_ar}
            onChange={(event) => setMemberForm({ ...memberForm, full_name_ar: event.target.value })}
            placeholder="الاسم الكامل بالعربية"
          />
          <input
            required
            className={inputClass}
            dir="ltr"
            value={memberForm.full_name_en}
            onChange={(event) => setMemberForm({ ...memberForm, full_name_en: event.target.value })}
            placeholder="Full name in English"
          />
          <input
            className={inputClass}
            value={memberForm.family_name_ar}
            onChange={(event) =>
              setMemberForm({ ...memberForm, family_name_ar: event.target.value })
            }
            placeholder="اسم العائلة بالعربية"
          />
          <input
            className={inputClass}
            dir="ltr"
            value={memberForm.family_name_en}
            onChange={(event) =>
              setMemberForm({ ...memberForm, family_name_en: event.target.value })
            }
            placeholder="Family name in English"
          />
          <select
            className={inputClass}
            value={memberForm.gender ?? ""}
            onChange={(event) =>
              setMemberForm({ ...memberForm, gender: event.target.value || null })
            }
          >
            <option value="">غير محدد · Unspecified</option>
            <option value="male">ذكر · Male</option>
            <option value="female">أنثى · Female</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputClass}
              dir="ltr"
              value={memberForm.birth_year ?? ""}
              onChange={(event) => setMemberForm({ ...memberForm, birth_year: event.target.value })}
              placeholder="Birth year"
            />
            <input
              className={inputClass}
              dir="ltr"
              value={memberForm.death_year ?? ""}
              onChange={(event) => setMemberForm({ ...memberForm, death_year: event.target.value })}
              placeholder="Death year"
            />
          </div>
          <select
            className={inputClass}
            value={memberForm.father_id ?? ""}
            onChange={(event) =>
              setMemberForm({ ...memberForm, father_id: event.target.value || null })
            }
          >
            <option value="">الأب: غير محدد · Father: none</option>
            {relativeOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name_ar} · {m.full_name_en}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={memberForm.mother_id ?? ""}
            onChange={(event) =>
              setMemberForm({ ...memberForm, mother_id: event.target.value || null })
            }
          >
            <option value="">الأم: غير محدد · Mother: none</option>
            {relativeOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name_ar} · {m.full_name_en}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={memberForm.spouse_id ?? ""}
            onChange={(event) =>
              setMemberForm({ ...memberForm, spouse_id: event.target.value || null })
            }
          >
            <option value="">الزوج/ة: غير محدد · Spouse: none</option>
            {relativeOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name_ar} · {m.full_name_en}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={memberForm.published ?? true}
              onChange={(event) =>
                setMemberForm({ ...memberForm, published: event.target.checked })
              }
            />
            منشور · Published
          </label>
          <textarea
            className={`${inputClass} min-h-16 sm:col-span-2`}
            value={memberForm.notes_ar ?? ""}
            onChange={(event) => setMemberForm({ ...memberForm, notes_ar: event.target.value })}
            placeholder="ملاحظات بالعربية"
          />
          <textarea
            className={`${inputClass} min-h-16 sm:col-span-2`}
            dir="ltr"
            value={memberForm.notes_en ?? ""}
            onChange={(event) => setMemberForm({ ...memberForm, notes_en: event.target.value })}
            placeholder="Notes in English"
          />
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            {memberForm.photo ? (
              <img
                src={resolveMediaUrl(memberForm.photo)}
                alt=""
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
            ) : null}
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
              <ImageUp className="h-4 w-4" /> Photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadMemberPhoto.mutate(file);
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={saveMember.isPending}>
              <Save /> {editingMemberId ? "Update" : "Add member"}
            </Button>
            {editingMemberId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingMemberId(null);
                  setMemberForm(emptyFamilyMember);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
          <TreeDeciduous className="h-4 w-4" /> Family tree · {membersQuery.data?.length ?? 0}
        </h2>
        <div className="mt-4 grid gap-3">
          {(membersQuery.data ?? []).map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
            >
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold">
                  {item.full_name_ar} · {item.full_name_en}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.family_name_ar} · {item.birth_year || "?"}–{item.death_year || ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => editMember(item)}>
                  <Pencil /> Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete this family member permanently? Any children referencing them as a parent will keep their record but lose that link.",
                      )
                    )
                      removeMember.mutate(item.id);
                  }}
                >
                  <Trash2 /> Delete
                </Button>
              </div>
            </article>
          ))}
          {!membersQuery.isLoading && !membersQuery.data?.length ? (
            <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
              No family members yet. Use the editor above to add the first one.
            </p>
          ) : null}
        </div>
      </section>

      {/* ============================================================ MEMORIALS */}
      <section
        id="memorial-editor"
        className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
      >
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-olive" />
          <div>
            <h2 className="font-display text-2xl font-semibold">
              {editingMemorialId
                ? "تعديل صفحة تخليد · Edit memorial"
                : "إضافة صفحة تخليد · Add memorial"}
            </h2>
            <p className="text-sm text-muted-foreground">
              New memorials default to unpublished — review the biography, then publish it.
            </p>
          </div>
        </div>
        <form onSubmit={onMemorialSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            required
            className={inputClass}
            value={memorialForm.full_name_ar}
            onChange={(event) =>
              setMemorialForm({ ...memorialForm, full_name_ar: event.target.value })
            }
            placeholder="الاسم الكامل بالعربية"
          />
          <input
            required
            className={inputClass}
            dir="ltr"
            value={memorialForm.full_name_en}
            onChange={(event) =>
              setMemorialForm({ ...memorialForm, full_name_en: event.target.value })
            }
            placeholder="Full name in English"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputClass}
              dir="ltr"
              value={memorialForm.birth_year ?? ""}
              onChange={(event) =>
                setMemorialForm({ ...memorialForm, birth_year: event.target.value })
              }
              placeholder="Birth year"
            />
            <input
              className={inputClass}
              dir="ltr"
              value={memorialForm.death_year ?? ""}
              onChange={(event) =>
                setMemorialForm({ ...memorialForm, death_year: event.target.value })
              }
              placeholder="Death year"
            />
          </div>
          <select
            className={inputClass}
            value={memorialForm.family_member_id ?? ""}
            onChange={(event) =>
              setMemorialForm({ ...memorialForm, family_member_id: event.target.value || null })
            }
          >
            <option value="">غير مرتبط بشجرة العائلة · Not linked to family tree</option>
            {(membersQuery.data ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name_ar} · {m.full_name_en}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={memorialForm.published ?? false}
              onChange={(event) =>
                setMemorialForm({ ...memorialForm, published: event.target.checked })
              }
            />
            منشور · Published
          </label>
          <textarea
            className={`${inputClass} min-h-24 sm:col-span-2`}
            value={memorialForm.biography_ar}
            onChange={(event) =>
              setMemorialForm({ ...memorialForm, biography_ar: event.target.value })
            }
            placeholder="نبذة عن حياته/حياتها بالعربية"
          />
          <textarea
            className={`${inputClass} min-h-24 sm:col-span-2`}
            dir="ltr"
            value={memorialForm.biography_en}
            onChange={(event) =>
              setMemorialForm({ ...memorialForm, biography_en: event.target.value })
            }
            placeholder="Short biography in English"
          />
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            {memorialForm.photo ? (
              <img
                src={resolveMediaUrl(memorialForm.photo)}
                alt=""
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
            ) : null}
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
              <ImageUp className="h-4 w-4" /> Photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadMemorialPhoto.mutate(file);
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={saveMemorial.isPending}>
              <Save /> {editingMemorialId ? "Update" : "Add memorial"}
            </Button>
            {editingMemorialId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingMemorialId(null);
                  setMemorialForm(emptyMemorial);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
          <Heart className="h-4 w-4" /> Memorials · {memorialsQuery.data?.length ?? 0}
        </h2>
        <div className="mt-4 grid gap-3">
          {(memorialsQuery.data ?? []).map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
            >
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold">
                  {item.full_name_ar} · {item.full_name_en}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.published ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => editMemorial(item)}
                >
                  <Pencil /> Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("Delete this memorial permanently?"))
                      removeMemorial.mutate(item.id);
                  }}
                >
                  <Trash2 /> Delete
                </Button>
              </div>
            </article>
          ))}
          {!memorialsQuery.isLoading && !memorialsQuery.data?.length ? (
            <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
              No memorials yet. Use the editor above to add the first one.
            </p>
          ) : null}
        </div>
      </section>

      {/* ============================================================ DONATIONS */}
      <section
        id="campaign-editor"
        className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
      >
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-olive" />
          <div>
            <h2 className="font-display text-2xl font-semibold">
              {editingCampaignId ? "تعديل حملة · Edit campaign" : "إضافة حملة تبرع · Add campaign"}
            </h2>
          </div>
        </div>
        <form onSubmit={onCampaignSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            required
            className={inputClass}
            value={campaignForm.title_ar}
            onChange={(event) => setCampaignForm({ ...campaignForm, title_ar: event.target.value })}
            placeholder="عنوان الحملة بالعربية"
          />
          <input
            required
            className={inputClass}
            dir="ltr"
            value={campaignForm.title_en}
            onChange={(event) => setCampaignForm({ ...campaignForm, title_en: event.target.value })}
            placeholder="Campaign title in English"
          />
          <textarea
            className={`${inputClass} min-h-20`}
            value={campaignForm.description_ar}
            onChange={(event) =>
              setCampaignForm({ ...campaignForm, description_ar: event.target.value })
            }
            placeholder="الوصف بالعربية"
          />
          <textarea
            className={`${inputClass} min-h-20`}
            dir="ltr"
            value={campaignForm.description_en}
            onChange={(event) =>
              setCampaignForm({ ...campaignForm, description_en: event.target.value })
            }
            placeholder="Description in English"
          />
          <label className="text-sm text-muted-foreground">
            Goal amount
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputClass} mt-1`}
              dir="ltr"
              value={campaignForm.goal_amount ?? 0}
              onChange={(event) =>
                setCampaignForm({ ...campaignForm, goal_amount: Number(event.target.value) })
              }
            />
          </label>
          <label className="text-sm text-muted-foreground">
            Raised so far
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputClass} mt-1`}
              dir="ltr"
              value={campaignForm.raised_amount ?? 0}
              onChange={(event) =>
                setCampaignForm({ ...campaignForm, raised_amount: Number(event.target.value) })
              }
            />
          </label>
          <input
            className={inputClass}
            dir="ltr"
            value={campaignForm.currency ?? "ILS"}
            onChange={(event) => setCampaignForm({ ...campaignForm, currency: event.target.value })}
            placeholder="Currency code, e.g. ILS"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={campaignForm.active ?? true}
              onChange={(event) =>
                setCampaignForm({ ...campaignForm, active: event.target.checked })
              }
            />
            نشطة · Active
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            {campaignForm.cover_image ? (
              <img
                src={resolveMediaUrl(campaignForm.cover_image)}
                alt=""
                className="h-16 w-24 rounded-sm border border-border object-cover"
              />
            ) : null}
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
              <ImageUp className="h-4 w-4" /> Cover image
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadCampaignCover.mutate(file);
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={saveCampaign.isPending}>
              <Save /> {editingCampaignId ? "Update" : "Add campaign"}
            </Button>
            {editingCampaignId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingCampaignId(null);
                  setCampaignForm(emptyCampaign);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
          <Wallet className="h-4 w-4" /> Campaigns · {campaignsQuery.data?.length ?? 0}
        </h2>
        <div className="mt-4 grid gap-3">
          {(campaignsQuery.data ?? []).map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
            >
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold">
                  {item.title_ar} · {item.title_en}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.raised_amount} / {item.goal_amount} {item.currency} ·{" "}
                  {item.active ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => editCampaign(item)}
                >
                  <Pencil /> Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("Delete this campaign permanently?"))
                      removeCampaign.mutate(item.id);
                  }}
                >
                  <Trash2 /> Delete
                </Button>
              </div>
            </article>
          ))}
          {!campaignsQuery.isLoading && !campaignsQuery.data?.length ? (
            <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
              No campaigns yet. Use the editor above to add the first one.
            </p>
          ) : null}
        </div>
      </section>

      <section
        id="method-editor"
        className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
      >
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-olive" />
          <div>
            <h2 className="font-display text-2xl font-semibold">
              {editingMethodId
                ? "تعديل وسيلة دفع · Edit payment method"
                : "إضافة وسيلة دفع · Add payment method"}
            </h2>
          </div>
        </div>
        <form onSubmit={onMethodSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <select
            className={inputClass}
            value={String(methodForm.kind ?? "bank")}
            onChange={(event) => setMethodForm({ ...methodForm, kind: event.target.value })}
          >
            <option value="bank">تحويل بنكي · Bank transfer</option>
            <option value="paypal">PayPal</option>
            <option value="cash">نقدًا · Cash</option>
            <option value="other">أخرى · Other</option>
          </select>
          <input
            required
            className={inputClass}
            value={methodForm.name_ar}
            onChange={(event) => setMethodForm({ ...methodForm, name_ar: event.target.value })}
            placeholder="الاسم بالعربية"
          />
          <input
            required
            className={inputClass}
            dir="ltr"
            value={methodForm.name_en}
            onChange={(event) => setMethodForm({ ...methodForm, name_en: event.target.value })}
            placeholder="Name in English"
          />
          <textarea
            className={`${inputClass} min-h-16`}
            value={methodForm.instructions_ar}
            onChange={(event) =>
              setMethodForm({ ...methodForm, instructions_ar: event.target.value })
            }
            placeholder="تعليمات التحويل بالعربية"
          />
          <textarea
            className={`${inputClass} min-h-16`}
            dir="ltr"
            value={methodForm.instructions_en}
            onChange={(event) =>
              setMethodForm({ ...methodForm, instructions_en: event.target.value })
            }
            placeholder="Instructions in English"
          />
          <textarea
            className={`${inputClass} min-h-16`}
            dir="ltr"
            value={methodForm.account_details ?? ""}
            onChange={(event) =>
              setMethodForm({ ...methodForm, account_details: event.target.value })
            }
            placeholder="Account/IBAN details (shown as-is, keep it accurate)"
          />
          <input
            className={inputClass}
            dir="ltr"
            value={methodForm.external_url ?? ""}
            onChange={(event) => setMethodForm({ ...methodForm, external_url: event.target.value })}
            placeholder="External link, e.g. PayPal.me URL"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={methodForm.active ?? true}
              onChange={(event) => setMethodForm({ ...methodForm, active: event.target.checked })}
            />
            نشط · Active
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            {methodForm.logo ? (
              <img
                src={resolveMediaUrl(methodForm.logo)}
                alt=""
                className="h-12 w-12 rounded-sm border border-border object-cover"
              />
            ) : null}
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
              <ImageUp className="h-4 w-4" /> Logo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadMethodLogo.mutate(file);
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={saveMethod.isPending}>
              <Save /> {editingMethodId ? "Update" : "Add method"}
            </Button>
            {editingMethodId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingMethodId(null);
                  setMethodForm(emptyPaymentMethod);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
          <Wallet className="h-4 w-4" /> Payment methods · {methodsQuery.data?.length ?? 0}
        </h2>
        <div className="mt-4 grid gap-3">
          {(methodsQuery.data ?? []).map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
            >
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold">
                  {item.name_ar} · {item.name_en}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.kind} · {item.active ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => editMethod(item)}>
                  <Pencil /> Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("Delete this payment method permanently?"))
                      removeMethod.mutate(item.id);
                  }}
                >
                  <Trash2 /> Delete
                </Button>
              </div>
            </article>
          ))}
          {!methodsQuery.isLoading && !methodsQuery.data?.length ? (
            <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
              No payment methods yet. Use the editor above to add the first one.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
