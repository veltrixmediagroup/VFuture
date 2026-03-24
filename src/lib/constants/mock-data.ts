import { formatISO, subDays } from "date-fns";
import type {
  EventItem,
  GalleryItem,
  NewsItem,
  SiteSetting,
  UserItem,
} from "@/lib/types/content";

const now = new Date();

function toVietnamIso(value: string) {
  return new Date(`${value}T00:00:00+07:00`).toISOString();
}

export const mockEvents: EventItem[] = [
  {
    id: "demo-event-1",
    title: "FW1: Panther Strikes!",
    description: "",
    start_date: toVietnamIso("2026-03-22"),
    end_date: toVietnamIso("2026-03-28"),
    image_url:
      "https://dl.dir.freefiremobile.com/common/Local/VN/Splash_Upload/260322_OB47VN_FW1_Panther_Strikes.png",
    thumbnail_url:
      "https://dl.dir.freefiremobile.com/common/Local/VN/Splash_Upload/260322_OB47VN_FW1_Panther_Strikes.png",
    link: null,
    status: "active",
  },
  {
    id: "demo-event-2",
    title: "Update store vang 2203",
    description: "",
    start_date: toVietnamIso("2026-03-22"),
    end_date: toVietnamIso("2026-03-28"),
    image_url:
      "https://dl.dir.freefiremobile.com/common/Local/VN/Splash_Upload/260322_OB47VN_Update_store_vang_2203.png",
    thumbnail_url:
      "https://dl.dir.freefiremobile.com/common/Local/VN/Splash_Upload/260322_OB47VN_Update_store_vang_2203.png",
    link: null,
    status: "active",
  },
  {
    id: "demo-event-3",
    title: "BUA TIEC AM NHAC",
    description: "",
    start_date: toVietnamIso("2026-03-23"),
    end_date: toVietnamIso("2026-03-29"),
    image_url:
      "https://dl.dir.freefiremobile.com/common/Local/VN/Splash_Upload/260323_OB47VN_QUA_BUA_TIEC_AM_NHAC.png",
    thumbnail_url:
      "https://dl.dir.freefiremobile.com/common/Local/VN/Splash_Upload/260323_OB47VN_QUA_BUA_TIEC_AM_NHAC.png",
    link: null,
    status: "upcoming",
  },
  {
    id: "demo-event-4",
    title: "TW1: Beat Beast Bundle",
    description: "",
    start_date: toVietnamIso("2026-03-24"),
    end_date: toVietnamIso("2026-03-30"),
    image_url:
      "https://dl.dir.freefiremobile.com/common/Local/VN/Splash_Upload/260324_OB47VN_TW1_Beat_Beast_Bundle.png",
    thumbnail_url:
      "https://dl.dir.freefiremobile.com/common/Local/VN/Splash_Upload/260324_OB47VN_TW1_Beat_Beast_Bundle.png",
    link: null,
    status: "upcoming",
  },
];

export const mockNews: NewsItem[] = [];

export const mockGallery: GalleryItem[] = [];

export const mockUsers: UserItem[] = [];

export const mockSettings: SiteSetting[] = [
  {
    id: "stg-1",
    key: "home.hero.title",
    value: "VFuture",
    updated_at: formatISO(subDays(now, 1)),
  },
  {
    id: "stg-2",
    key: "home.background.desktop_urls",
    value:
      "https://dl.dir.freefiremobile.com/common/web_event/official2.ff.garena.all/20263/697b5d2e34ac088f5b5a4427d57f6281.jpg",
    updated_at: formatISO(subDays(now, 1)),
  },
  {
    id: "stg-3",
    key: "home.background.mobile_urls",
    value:
      "https://dl.dir.freefiremobile.com/common/web_event/official2.ff.garena.all/20263/0680c1792156b8a80095c669520f019a.jpg",
    updated_at: formatISO(subDays(now, 1)),
  },
  {
    id: "stg-4",
    key: "home.background.interval_seconds",
    value: "5",
    updated_at: formatISO(subDays(now, 1)),
  },
  {
    id: "stg-5",
    key: "home.background.transition_seconds",
    value: "1",
    updated_at: formatISO(subDays(now, 1)),
  },
  {
    id: "stg-6",
    key: "home.background.transition_effect",
    value: "fade",
    updated_at: formatISO(subDays(now, 1)),
  },
  {
    id: "stg-7",
    key: "seo.default_title",
    value: "VFuture",
    updated_at: formatISO(subDays(now, 1)),
  },
  {
    id: "stg-8",
    key: "analytics.views",
    value: "0",
    updated_at: formatISO(subDays(now, 1)),
  },
  {
    id: "stg-9",
    key: "social.email",
    value: "blazehunter01062008@gmail.com",
    updated_at: formatISO(subDays(now, 1)),
  },
  {
    id: "stg-10",
    key: "news.categories",
    value: "ESPORTS\nPATCH NOTE\nCỘNG ĐỒNG",
    updated_at: formatISO(subDays(now, 1)),
  },
];
