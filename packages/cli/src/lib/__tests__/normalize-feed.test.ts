import type Parser from "rss-parser";
import { describe, expect, it } from "vitest";
import { normalizeFeed } from "../normalize-feed";

describe("normalizeFeed", () => {
  it("smoke test", () => {
    const mockInput: Parser.Output<any> = {
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [],
    };

    expect(() => normalizeFeed(mockInput, "https://example.com/feed/feed.xml")).not.toThrow();
  });

  it("resolve invalid URL to null in item link", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "https://123        .",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].link).toBe(null);
  });

  it("resolve invalid relatve URL to null in item link", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "\\\\",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].link).toBe(null);
  });

  it("ignore feed url from the parser", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/hello-world/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "https://example.com/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url in item link", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "https://example.com/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url relative to feed host as a file", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url relative to feed host as path", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/rss",
      title: "Mock title",
      items: [
        {
          link: "/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url relative to feed host as path with trailing slash", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/rss/",
      title: "Mock title",
      items: [
        {
          link: "/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url relative to feed endpoint", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "./asset/page.html",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/feed/asset/page.html");
  });

  it("resolve url relative to feed endpoint as its parent", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "../asset/page.html",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/asset/page.html");
  });

  it("resolve image url from enclosure", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          enclosure: {
            type: "image/png",
            url: "https://example.com/asset/image.png",
          },
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve relative image url from enclosure", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          enclosure: {
            type: "image/png",
            url: "/asset/image.png",
          },
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve image url from thumbnail", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          "media:thumbnail": "https://example.com/asset/image.png",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve relative image url from thumbnail", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          "media:thumbnail": "/asset/image.png",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve empty URL to null in item link", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].link).toBe(null);
  });

  it("uses contentSnippet as content when available", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          contentSnippet: "Plain text snippet",
          content: "<p>Plain text snippet</p>",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].content).toBe("Plain text snippet");
  });

  it("strips HTML from raw content when contentSnippet is missing", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          content: "<p>Hello <b>world</b></p>",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].content).toBe("Hello world");
  });

  it("returns null content when both contentSnippet and content are missing", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [{}],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].content).toBe(null);
  });

  it("returns null content when content has only HTML tags and no text", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          content: "<img src=\"image.png\" /><br/>",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].content).toBe(null);
  });

  it("uses content:encodedSnippet as content when description fields are missing", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          "content:encoded": "<p>Full article body</p>",
          "content:encodedSnippet": "Full article body",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].content).toBe("Full article body");
  });

  it("strips HTML from content:encoded when content:encodedSnippet is missing", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          "content:encoded": "<p>Full article <b>body</b></p>",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].content).toBe("Full article body");
  });

  it("prefers contentSnippet over content:encodedSnippet", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          contentSnippet: "Short description",
          "content:encoded": "<p>Full article body</p>",
          "content:encodedSnippet": "Full article body",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].content).toBe("Short description");
  });

  it("uses ns0:encodedSnippet as content when description and content:encoded fields are missing", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          "ns0:encoded": "<p>Article via ns0 namespace</p>",
          "ns0:encodedSnippet": "Article via ns0 namespace",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].content).toBe("Article via ns0 namespace");
  });

  it("strips HTML from ns0:encoded when ns0:encodedSnippet is missing", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          "ns0:encoded": "<p>Article <em>body</em></p>",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].content).toBe("Article body");
  });
});
