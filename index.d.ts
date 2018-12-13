declare module "supercrawler" {
  import { EventEmitter } from "events";

  export class Crawler extends EventEmitter {
    constructor(input?: {
      /**
       * Custom instance of `UrlList` type queue. Defaults to `FifoUrlList`,
       * which processes URLs in the order that they were added to the queue;
       * once they are removed from the queue, they cannot be recrawled.
       */
      urlList?: UrlList;

      /**
       * Number of milliseconds between requests. Defaults to 1000.
       */
      interval?: number;

      /**
       * Maximum number of concurrent requests. Defaults to 5.
       */
      concurrentRequestsLimit?: number;

      /**
       * Number of milliseconds that robots.txt should be cached for.
       * Defaults to 3600000 (1 hour).
       */
      robotsCacheTime?: number;

      /**
       * User agent to use for requests. Defaults to
       * `Mozilla/5.0 (compatible; supercrawler/1.0; +https://github.com/brendonboshell/supercrawler)`
       */
      userAgent?: string;

      /**
       * Object of options to be passed to [request](https://github.com/request/request).
       * Note that request does not support an asynchronous (and distributed) cookie jar.
       */
      request?: { [prop: string]: any };
    });

    /**
     * Get the UrlList type instance.
     */
    getUrlList(): UrlList;

    /**
     * Get the interval setting.
     */
    getInterval(): number;

    /**
     * Get the maximum number of concurrent requests.
     */
    getConcurrentRequestsLimit(): number;

    /**
     * Get the user agent.
     */
    getUserAgent(): string;

    /**
     * Start crawling.
     */
    start(): void;

    /**
     * Stop crawling.
     */
    stop(): void;

    /**
     * Add a handler for all content types.
     */
    addHandler(handler: any): void;

    /**
     * Add a handler for a specific content type.
     */
    addHandler(contentType: string, handler: any): void;

    /**
     * Fires when crawling starts with a new URL.
     */
    on(event: "crawlurl", listener: CrawlUrlListener): this;

    /**
     * Fires when crawling of a URL is complete. `errorCode` is `null` if no
     * error occurred. `statusCode` is set if and only if the request was successful.
     */
    on(event: "crawledurl", listener: CrawledUrlListener): this;

    /**
     * Fires when the URL list is (intermittently) empty.
     */
    on(event: "urllistempty", listener: () => void): this;

    /**
     * Fires when the URL list is permanently empty, barring URLs added by
     * external sources. This only makes sense when running Supercrawler in
     * non-distributed fashion.
     */
    on(event: "urllistcomplete", listener: () => void): this;
  }

  export type CrawlUrlListener = (url: string) => void;
  export type CrawledUrlListener = (
    url: string,
    errorCode?: string | null,
    statusCode?: number | null
  ) => void;

  export abstract class UrlList {
    insertIfNotExists(url: Url): Promise<Url>;

    upsert(url: Url): Promise<Url>;

    getNextUrl(): Promise<Url>;
  }

  export class FifoUrlList extends UrlList {}

  export class DbUrlList extends UrlList {
    constructor(opts: {
      database: string;
      username: string;
      password: string;
      sequelizeOpts: {
        dialect: "mysql" | "sqlite" | "postgres" | "mssql";
        host?: string;
      };
    });
  }

  export class Url {
    constructor(
      input: string | { url: string; statusCode?: number; errorCode?: string }
    );

    getUniqueId(): string;

    getUrl(): string;

    getStatusCode(): number | null;

    getErrorCode(): string | null;
  }

  export const handlers: {
    robotsParser(): (context: HandlerContext) => void;
    sitemapsParser(): (context: HandlerContext) => void;
    htmlLinkParser(opts?: {
      /**
       * Array of hostnames that are allowed to be crawled.
       */
      hostnames?: string[];
    }): (context: HandlerContext) => void;
  };

  export interface HandlerContext {
    /**
     * Content type, e.g. "text/html; charset=utf8".
     */
    contentType: string;

    /**
     * Body content.
     */
    body: string;

    /**
     * Page URL, absolute.
     */
    url: string;
  }
}
