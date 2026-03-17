import Parser from "rss-parser";
import { getNonEmptyStringOrNull } from "../utils/ensure-string-content";
import { htmlToText } from "../utils/html-to-text";
import { resolveRelativeUrl } from "../utils/url";

export interface ParsedFeed {
  link: string | null;
  title: string | null;
  items: ParsedFeedItem[];
}

export interface ParsedFeedItem {
  guid: string | null;
  title: string | null;
  link: string | null;
  isoDate: string | null;
  creator: string | null;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  itunes?: {
    duration: string;
  };
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
}

export function normalizeFeed(feed: Parser.Output<CustomFields>, feedUrl: string): ParsedFeed {
  return {
    link: getNonEmptyStringOrNull(feed.link),
    title: getNonEmptyStringOrNull(feed.title),
    items: feed.items.map((item) => {
      const thumbnailImage = getNonEmptyStringOrNull(item["media:thumbnail"]);
      const enclosureImage = item.enclosure?.type.startsWith("image/")
        ? getNonEmptyStringOrNull(item.enclosure.url)
        : null;
      const link = getNonEmptyStringOrNull(item.link);
      const imageUrl = thumbnailImage ?? enclosureImage;

      return {
        content: getContentFromItem(item),
        creator: getNonEmptyStringOrNull(item.creator),
        guid: getNonEmptyStringOrNull(item.guid),
        isoDate: getNonEmptyStringOrNull(item.isoDate),
        link: link ? resolveRelativeUrl(link, feedUrl) : null,
        summary: getNonEmptyStringOrNull(item.summary),
        title: getNonEmptyStringOrNull(item.title),
        imageUrl: imageUrl ? resolveRelativeUrl(imageUrl, feedUrl) : null,
        ...getItunesFields(item),
      };
    }),
  };
}

function getContentFromItem(item: Parser.Item & CustomFields): string | null {
  const snippet = getNonEmptyStringOrNull(item.contentSnippet);
  if (snippet) return snippet;

  if (item.content) {
    return getNonEmptyStringOrNull(htmlToText(item.content));
  }

  const encodedSnippet =
    getNonEmptyStringOrNull(item["content:encodedSnippet"]) ?? getNonEmptyStringOrNull(item["ns0:encodedSnippet"]);
  if (encodedSnippet) return encodedSnippet;

  const encoded = item["content:encoded"] ?? item["ns0:encoded"];
  if (encoded) {
    return getNonEmptyStringOrNull(htmlToText(encoded));
  }

  return null;
}

function getItunesFields(itunesItem: CustomFields) {
  const itunes = itunesItem.itunes
    ? {
        duration: itunesItem.itunes.duration,
      }
    : undefined;

  const enclosure = itunesItem.enclosure
    ? {
        ...itunesItem.enclosure,
      }
    : undefined;

  return {
    itunes,
    enclosure,
  };
}

interface CustomFields {
  itunes?: {
    duration: string;
  };
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
  "media:thumbnail": string;
  "content:encoded"?: string;
  "content:encodedSnippet"?: string;
  "ns0:encoded"?: string;
  "ns0:encodedSnippet"?: string;
}
