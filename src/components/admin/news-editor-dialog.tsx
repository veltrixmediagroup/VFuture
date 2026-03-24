"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/common/date-picker-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NewsItem } from "@/lib/types/content";
import type { NewsInput } from "@/lib/validators/news";
import {
  formatVietnamDateInput,
  toVietnamIsoFromDateInput,
} from "@/lib/utils/vietnam-time";

const NEWS_CATEGORIES_SETTING_KEY = "news.categories";
const DEFAULT_NEWS_CATEGORIES = ["ESPORTS", "PATCH NOTE", "CỘNG ĐỒNG"];

function normalizeCategoryLabel(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function parseCategorySetting(rawValue?: string) {
  const categories = (rawValue ?? "")
    .split(/\r?\n|,/)
    .map((item) => normalizeCategoryLabel(item))
    .filter(Boolean);

  return Array.from(new Set(categories));
}

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createFallbackExcerpt(title: string) {
  return `${title} - CẬP NHẬT TIN TỨC MỚI.`;
}

function createFallbackContent(title: string) {
  return `<p>${title}</p>`;
}

const newsFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(6, "Tiêu đề cần ít nhất 6 ký tự.").max(160),
  cover: z.string().url("Ảnh bìa phải là URL hợp lệ."),
  category: z.string().min(2, "Danh mục cần ít nhất 2 ký tự.").max(60),
  created_at: z.string().min(1, "Vui lòng chọn ngày đăng."),
  content: z.string().min(20, "Nội dung cần ít nhất 20 ký tự.").max(5000),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

type NewsEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: NewsItem | null;
  triggerLabel: string;
  showTrigger?: boolean;
  onSaved: () => Promise<void>;
};

export function NewsEditorDialog({
  open,
  onOpenChange,
  initialData,
  triggerLabel,
  showTrigger = true,
  onSaved,
}: NewsEditorDialogProps) {
  const {
    control,
    register,
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      cover: "",
      category: "ESPORTS",
      created_at: formatVietnamDateInput(new Date()),
    },
  });
  const [categories, setCategories] = useState<string[]>(DEFAULT_NEWS_CATEGORIES);
  const [newCategory, setNewCategory] = useState("");
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [content, setContent] = useState(initialData?.content ?? "");
  const contentEditableRef = useRef<HTMLDivElement | null>(null);
  const selectedCategory = watch("category");

  const loadCategories = useCallback(async () => {
    const response = await fetch("/api/admin/settings", {
      cache: "no-store",
    });

    if (!response.ok) {
      const fallbackCategories = initialData?.category
        ? Array.from(new Set([initialData.category, ...DEFAULT_NEWS_CATEGORIES]))
        : DEFAULT_NEWS_CATEGORIES;
      setCategories(fallbackCategories);
      return;
    }

    const data = (await response.json()) as { settings?: Array<{ key: string; value: string }> };
    const rawSetting = data.settings?.find((item) => item.key === NEWS_CATEGORIES_SETTING_KEY)?.value;
    const parsedCategories = parseCategorySetting(rawSetting);
    const fallbackCategories = parsedCategories.length > 0 ? parsedCategories : DEFAULT_NEWS_CATEGORIES;
    const mergedCategories = initialData?.category
      ? Array.from(new Set([normalizeCategoryLabel(initialData.category), ...fallbackCategories]))
      : fallbackCategories;
    const preferredCategory = initialData?.category
      ? normalizeCategoryLabel(initialData.category)
      : DEFAULT_NEWS_CATEGORIES[0];

    setCategories(mergedCategories);
    setValue(
      "category",
      mergedCategories.includes(preferredCategory) ? preferredCategory : mergedCategories[0] ?? DEFAULT_NEWS_CATEGORIES[0],
      { shouldValidate: true },
    );
  }, [initialData?.category, setValue]);

  const persistCategories = async (nextCategories: string[], successMessage: string) => {
    setIsCategorySaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: NEWS_CATEGORIES_SETTING_KEY,
        value: nextCategories.join("\n"),
      }),
    });

    setIsCategorySaving(false);

    if (!response.ok) {
      toast.error("KHÔNG THỂ CẬP NHẬT DANH MỤC.");
      return;
    }

    setCategories(nextCategories);

    if (!nextCategories.includes(normalizeCategoryLabel(selectedCategory ?? ""))) {
      setValue("category", nextCategories[0] ?? DEFAULT_NEWS_CATEGORIES[0], { shouldValidate: true });
    }

    toast.success(successMessage);
  };

  const addCategory = async () => {
    const normalizedCategory = normalizeCategoryLabel(newCategory);
    if (!normalizedCategory) {
      return;
    }

    if (categories.includes(normalizedCategory)) {
      toast.error("DANH MỤC ĐÃ TỒN TẠI.");
      return;
    }

    const nextCategories = [...categories, normalizedCategory];
    await persistCategories(nextCategories, "ĐÃ THÊM DANH MỤC.");
    setValue("category", normalizedCategory, { shouldValidate: true });
    setNewCategory("");
  };

  const removeCategory = async (category: string) => {
    if (categories.length <= 1) {
      toast.error("CẦN GIỮ LẠI ÍT NHẤT 1 DANH MỤC.");
      return;
    }

    const nextCategories = categories.filter((item) => item !== category);
    await persistCategories(nextCategories, "ĐÃ XÓA DANH MỤC.");
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadCategories();

    if (initialData) {
      reset({
        id: initialData.id,
        title: initialData.title,
        cover: initialData.cover,
        category: normalizeCategoryLabel(initialData.category),
        created_at: formatVietnamDateInput(initialData.created_at),
        content: initialData.content ?? "",
      });
      setContent(initialData.content ?? "");
      return;
    }

    reset({
      title: "",
      cover: "",
      category: DEFAULT_NEWS_CATEGORIES[0],
      created_at: formatVietnamDateInput(new Date()),
      content: "",
    });
    setContent("");
  }, [initialData, loadCategories, open, reset]);

  useEffect(() => {
    if (!open || !contentEditableRef.current) {
      return;
    }

    contentEditableRef.current.innerHTML = content || "<p>Nhập nội dung bài viết...</p>";
    setValue("content", content, { shouldValidate: true });
  }, [open, content, setValue]);

  useEffect(() => {
    setValue("content", content, { shouldValidate: true });
  }, [content, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const normalizedTitle = values.title.trim();
    const finalContent = content.trim() || initialData?.content?.trim() || createFallbackContent(normalizedTitle);
    const excerptFromContent = finalContent.replace(/<[^>]+>/g, "").slice(0, 220).trim() || createFallbackExcerpt(normalizedTitle);

    const payload: NewsInput = {
      ...values,
      slug: createSlug(normalizedTitle),
      excerpt: initialData?.excerpt?.trim() || excerptFromContent,
      content: finalContent,
      created_at: toVietnamIsoFromDateInput(values.created_at),
      status: "published",
    };

    const response = await fetch("/api/admin/news", {
      method: initialData ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.error(errorData?.error ?? "Không thể lưu bài viết.");
      return;
    }

    toast.success(initialData ? "Đã cập nhật bài viết." : "Đã tạo bài viết.");
    onOpenChange(false);
    await onSaved();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <DialogTrigger className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium uppercase tracking-[0.08em] text-primary-foreground transition hover:brightness-110">
          {triggerLabel}
        </DialogTrigger>
      ) : null}

      <DialogContent className="max-h-[92vh] overflow-visible border-border bg-card p-0 text-foreground sm:max-w-3xl">
        <div className="max-h-[92vh] overflow-y-auto px-6 py-6">
          <DialogHeader className="mb-4 pr-10">
            <DialogTitle className="font-heading text-xl uppercase tracking-[0.08em] text-foreground">
              {initialData ? "CHỈNH SỬA TIN TỨC" : "TẠO TIN TỨC"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              BIỂU MẪU TỐI GIẢN GIỐNG TẠO SỰ KIỆN. HỆ THỐNG TỰ XỬ LÝ PHẦN NỘI DUNG PHỤ ĐỂ BẠN TẬP TRUNG VÀO TIÊU ĐỀ, ẢNH, DANH MỤC VÀ NGÀY ĐĂNG.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                TIÊU ĐỀ
              </label>
              <Input {...register("title")} className="border-border bg-background text-foreground" />
              {errors.title ? <p className="text-xs text-rose-500">{errors.title.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                NGÀY ĐĂNG
              </label>
              <Controller
                control={control}
                name="created_at"
                render={({ field }) => <DatePickerInput value={field.value} onChange={field.onChange} />}
              />
              {errors.created_at ? <p className="text-xs text-rose-500">{errors.created_at.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                ẢNH TIN TỨC
              </label>
              <Input {...register("cover")} className="border-border bg-background text-foreground" />
              {errors.cover ? <p className="text-xs text-rose-500">{errors.cover.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                NỘI DUNG TIN TỨC (Rich Text)
              </label>

              <div className="flex flex-wrap gap-1 pb-2 border-b border-border">
                {/* Text Formatting */}
                <button type="button" className="btn-format" onClick={() => document.execCommand("bold")} title="Bold">B</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("italic")} title="Italic">I</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("underline")} title="Underline">U</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("strikeThrough")} title="Strikethrough">S</button>

                {/* Headers */}
                <div className="w-px h-6 bg-border mx-1"></div>
                <button type="button" className="btn-format" onClick={() => document.execCommand("formatBlock", false, "H1")} title="Heading 1">H1</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("formatBlock", false, "H2")} title="Heading 2">H2</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("formatBlock", false, "H3")} title="Heading 3">H3</button>

                {/* Lists */}
                <div className="w-px h-6 bg-border mx-1"></div>
                <button type="button" className="btn-format" onClick={() => document.execCommand("insertUnorderedList")} title="Bullet List">•</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("insertOrderedList")} title="Numbered List">1.</button>

                {/* Alignment */}
                <div className="w-px h-6 bg-border mx-1"></div>
                <button type="button" className="btn-format" onClick={() => document.execCommand("justifyLeft")} title="Align Left">⬅</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("justifyCenter")} title="Align Center">⬌</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("justifyRight")} title="Align Right">➡</button>

                {/* Links & Media */}
                <div className="w-px h-6 bg-border mx-1"></div>
                <button
                  type="button"
                  className="btn-format"
                  onClick={() => {
                    const url = window.prompt("URL link:");
                    if (url) document.execCommand("createLink", false, url);
                  }}
                  title="Insert Link"
                >
                  🔗
                </button>
                <button
                  type="button"
                  className="btn-format"
                  onClick={() => {
                    const email = window.prompt("Email address:");
                    if (email) {
                      const mailtoLink = `mailto:${email}`;
                      document.execCommand("createLink", false, mailtoLink);
                    }
                  }}
                  title="Insert Email Link"
                >
                  ✉
                </button>

                {/* Colors */}
                <div className="w-px h-6 bg-border mx-1"></div>
                <button type="button" className="btn-format" onClick={() => document.execCommand("foreColor", false, "#007bff")} title="Blue Text" style={{ color: "#007bff" }}>A</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("foreColor", false, "#28a745")} title="Green Text" style={{ color: "#28a745" }}>A</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("foreColor", false, "#dc3545")} title="Red Text" style={{ color: "#dc3545" }}>A</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("backColor", false, "#ffff00")} title="Highlight Yellow">🖍</button>

                {/* Special Formats */}
                <div className="w-px h-6 bg-border mx-1"></div>
                <button type="button" className="btn-format" onClick={() => document.execCommand("formatBlock", false, "BLOCKQUOTE")} title="Quote Block">&quot;</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("formatBlock", false, "PRE")} title="Code Block">{"</>"}</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("insertHorizontalRule")} title="Horizontal Line">━</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("insertLineBreak")} title="Line Break">⏎</button>

                {/* Font Size */}
                <div className="w-px h-6 bg-border mx-1"></div>
                <button type="button" className="btn-format" onClick={() => document.execCommand("fontSize", false, "1")} title="Small Text">S</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("fontSize", false, "3")} title="Normal Text">M</button>
                <button type="button" className="btn-format" onClick={() => document.execCommand("fontSize", false, "5")} title="Large Text">L</button>
              </div>

              <div
                ref={contentEditableRef}
                contentEditable
                className="min-h-[230px] rounded-xl border border-border bg-background p-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onInput={() => {
                  const nextContent = contentEditableRef.current?.innerHTML ?? "";
                  setContent(nextContent);
                  setValue("content", nextContent, { shouldValidate: true });
                }}
                onPaste={(event) => {
                  const clipboardData = event.clipboardData;
                  if (!clipboardData) return;

                  const imageFile = Array.from(clipboardData.files).find((file) => file.type.startsWith("image/"));
                  if (imageFile) {
                    event.preventDefault();
                    const reader = new FileReader();
                    reader.onload = () => {
                      const imgUrl = String(reader.result);
                      const figure = document.createElement("figure");
                      const img = document.createElement("img");
                      img.src = imgUrl;
                      img.style.maxWidth = "100%";
                      img.style.marginBottom = "0.4rem";
                      const caption = document.createElement("figcaption");
                      caption.contentEditable = "true";
                      caption.className = "text-xs text-muted-foreground italic";
                      caption.innerText = "Nhập chú thích ảnh (tùy chọn - click để chỉnh sửa)";
                      figure.appendChild(img);
                      figure.appendChild(caption);
                      contentEditableRef.current?.appendChild(figure);
                      setContent(contentEditableRef.current?.innerHTML ?? "");
                    };
                    reader.readAsDataURL(imageFile);
                  } else {
                    const text = clipboardData.getData("text/plain");
                    if (text) {
                      event.preventDefault();
                      const selection = window.getSelection();
                      if (selection?.getRangeAt && selection.rangeCount > 0) {
                        selection.deleteFromDocument();
                        const range = selection.getRangeAt(0);

                        // Enhanced text processing with multiple formats
                        let processedText = text;

                        // Email detection and formatting
                        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
                        processedText = processedText.replace(emailRegex, (email) => {
                          return `<a href="mailto:${email}" style="color:#007bff; text-decoration:underline; font-weight:500;">${email}</a>`;
                        });

                        // URL detection and formatting
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        processedText = processedText.replace(urlRegex, (url) => {
                          return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#28a745; text-decoration:underline;">${url}</a>`;
                        });

                        // Phone number detection (Vietnamese format)
                        const phoneRegex = /(\+84|0)[3|5|7|8|9][0-9]{8}\b/g;
                        processedText = processedText.replace(phoneRegex, (phone) => {
                          return `<a href="tel:${phone}" style="color:#dc3545; text-decoration:underline; font-weight:500;">${phone}</a>`;
                        });

                        // Hashtag detection
                        const hashtagRegex = /#(\w+)/g;
                        processedText = processedText.replace(hashtagRegex, (match, tag) => {
                          return `<span style="color:#6f42c1; font-weight:600;">${match}</span>`;
                        });

                        // Mention detection (@username)
                        const mentionRegex = /@(\w+)/g;
                        processedText = processedText.replace(mentionRegex, (match, username) => {
                          return `<span style="color:#e83e8c; font-weight:600;">${match}</span>`;
                        });

                        const el = document.createElement("span");
                        el.innerHTML = processedText;
                        range.insertNode(el);
                        range.collapse(false);
                        setContent(contentEditableRef.current?.innerHTML ?? "");
                      }
                    }
                  }
                }}
                suppressContentEditableWarning
              />
              <p className="text-xs text-muted-foreground">
                <strong>Tính năng định dạng:</strong> Bold, Italic, Underline, Headers, Lists, Alignment, Colors, Links, Email, Code blocks, Quotes.
                <br />
                <strong>Paste thông minh:</strong> Dán ảnh trực tiếp + chú thích, tự động format email, URL, phone, hashtag, mention.
              </p>
              {errors.content ? <p className="text-xs text-rose-500">{errors.content.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                DANH MỤC
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue("category", value ?? "", { shouldValidate: true })}
              >
                <SelectTrigger className="border-border bg-background uppercase tracking-[0.08em] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="uppercase tracking-[0.08em]">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category ? <p className="text-xs text-rose-500">{errors.category.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                THÊM DANH MỤC MỚI
              </label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="THÊM DANH MỤC MỚI"
                  className="border-border bg-background text-foreground"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 rounded-xl"
                  onClick={addCategory}
                  disabled={isCategorySaving}
                >
                  <Plus className="mr-2 size-4" />
                  THÊM
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:col-span-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => void removeCategory(category)}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary transition hover:border-primary/35"
                >
                  {category}
                  <X className="size-3.5" />
                </button>
              ))}
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl">
                {isSubmitting ? "ĐANG LƯU..." : "LƯU TIN TỨC"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
