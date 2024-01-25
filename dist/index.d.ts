declare module "javascript/utils" {
    /** Generate random string of given lenght.
    Default alphabet includes digits, upper and lower case chars. */
    export const randomString: (length: number, characters?: string) => string;
    /** Shuffle array in-place. Taken from https://javascript.info/task/shuffle */
    export const shuffleArray: <T>(array: T[]) => void;
    /** Check if n is natural number */
    export const isNatNumber: (n: number | string) => boolean;
    /** Debounced Svelte Store
    Same as Svelte Stores, but result is updated only if result is stable since millis */
    export const debounced: <T>(millis: number, defaultValue?: T) => {
        subscribe: (this: void, run: import("svelte/store").Subscriber<T>, invalidate?: import("svelte/store").Invalidator<T>) => import("svelte/store").Unsubscriber;
        flush: () => T;
        get: () => T;
        set: (newValue: T) => void;
        lazySet: (newValue: T) => void;
    };
    /** Completely absorb and prevent click propagation */
    export const preventClickPropagation: (node: HTMLElement) => void;
    export const greekLetters: string[];
    /** Find if two segments have and intersection
     https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function */
    export const intersects: (a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number) => boolean;
    export const scaleVector: ([x0, y0]: [number, number], length: number) => number[];
    /** Check if a string may be parsed as number */
    export const isNumeric: (str: string) => boolean;
    /** Convert an angle from degree to radians */
    export const deg2rad: (angle: number) => number;
    /** Convert an angle from degree to radians */
    export const rad2deg: (angle: number) => number;
    /** Get an array with numbers in range. For example,
    range(3, 8, 2) => [3, 5, 7 ]  */
    export const range: (start: number, stop: number, step?: number) => any[];
    /** Execute the callback if and only if the event is mouse */
    export const onlyOnMouse: (callback: any) => (e: any) => void;
    export const wait: (ms: number) => Promise<unknown>;
    export const charIndex: (index: number) => string;
    export const indexOfChar: (char: string) => number;
    export const mod: (n: number, m: number) => number;
    export const inRange: (n: number, min: number, max: number) => number;
    export const UUIDGeneratorBrowser: () => string;
    export const asAny: (value: any) => any;
}
declare module "javascript/special-svelte-stores" {
    import { type Writable } from 'svelte/store';
    export const storable: (localStorageKey: string, defaultValues: Record<string, any>) => Record<string, Writable<any>>;
    export const mergeable: <T>() => {
        subscribe: (this: void, run: import("svelte/store").Subscriber<Record<string, T>>, invalidate?: import("svelte/store").Invalidator<Record<string, T>>) => import("svelte/store").Unsubscriber;
        extend: (initialValue?: Record<string, T>) => Writable<Record<string, T>>;
    };
    export const arrayable: <T>() => {
        subscribe: (this: void, run: import("svelte/store").Subscriber<T[]>, invalidate?: import("svelte/store").Invalidator<T[]>) => import("svelte/store").Unsubscriber;
        extend: (initialValue?: T | T[]) => Writable<T | T[]>;
    };
    export const debouncable: <T>(millis: number, defaultValue: T) => {
        subscribe: (this: void, run: import("svelte/store").Subscriber<T>, invalidate?: import("svelte/store").Invalidator<T>) => import("svelte/store").Unsubscriber;
        flush: () => T;
        get: () => T;
        set: (newValue: T) => void;
        lazySet: (newValue: T) => void;
    };
}
declare module "javascript/plugin-interface" {
    import { type ComponentType, SvelteComponent } from "svelte";
    export const defaultBookProperties: {
        subscribe: (this: void, run: import("svelte/store").Subscriber<Record<string, string>>, invalidate?: import("svelte/store").Invalidator<Record<string, string>>) => import("svelte/store").Unsubscriber;
        extend: (initialValue?: Record<string, string>) => import("svelte/store").Writable<Record<string, string>>;
    };
    type PluginPanel = {
        tabs: {
            id: string;
            label: string;
            icon: string;
        }[];
        widget: ComponentType<SvelteComponent<any>>;
    };
    export const pluginPanel: {
        subscribe: (this: void, run: import("svelte/store").Subscriber<PluginPanel[]>, invalidate?: import("svelte/store").Invalidator<PluginPanel[]>) => import("svelte/store").Unsubscriber;
        extend: (initialValue?: PluginPanel | PluginPanel[]) => import("svelte/store").Writable<PluginPanel | PluginPanel[]>;
    };
    export const settingsDialog: {
        subscribe: (this: void, run: import("svelte/store").Subscriber<ComponentType<SvelteComponent<any, any, any>>[]>, invalidate?: import("svelte/store").Invalidator<ComponentType<SvelteComponent<any, any, any>>[]>) => import("svelte/store").Unsubscriber;
        extend: (initialValue?: ComponentType<SvelteComponent<any, any, any>> | ComponentType<SvelteComponent<any, any, any>>[]) => import("svelte/store").Writable<ComponentType<SvelteComponent<any, any, any>> | ComponentType<SvelteComponent<any, any, any>>[]>;
    };
    export const bookFormats: {
        subscribe: (this: void, run: import("svelte/store").Subscriber<Record<string, any>>, invalidate?: import("svelte/store").Invalidator<Record<string, any>>) => import("svelte/store").Unsubscriber;
        extend: (initialValue?: Record<string, any>) => import("svelte/store").Writable<Record<string, any>>;
    };
}
declare module "javascript/book-utils" {
    export const sanitizeKey: (key: string) => string;
    export const atLinePosition: (text: string, lineNumber: number, end?: boolean) => void;
    export type BookChapter = {
        key: string;
        title: string;
        group: string;
        flags: string[];
        lines: {
            start: number;
            textStart: number;
            textEnd: number;
            end: number;
        };
        links: string[];
        linkedFrom: number[];
    };
    export type BookIndex = {
        title: string;
        lines: {
            titlePageEnd: number;
            end: number;
        };
        lineStarts: number[];
        properties: Record<string, string>;
        chapters: BookChapter[];
        keys: {
            [key: string]: number;
        };
        chaptersWith: {
            key: {
                [key: string]: number[];
            };
            group: {
                [group: string]: number[];
            };
            flag: {
                [flag: string]: number[];
            };
        };
    };
    export const indexBook: (bookText: string, defaultProperties?: Record<string, string> | null) => BookIndex;
    export type BookChapterContent = {
        text: string;
        content: string;
    };
    export type BookContent = {
        titlePage: string;
        chapters: BookChapterContent[];
    };
    export const contentBook: (bookOrText: string, index?: BookIndex) => {
        titlePage: string;
        chapters: {
            text: string;
            content: string;
        }[];
    };
    export interface Book {
        text: string;
        index: BookIndex;
        content: BookContent;
    }
    export interface EditableBook extends Book {
        set: (newText: string) => void;
        replace: (from: number, to: number, newText: string) => void;
        apply: (transformation: (book: this) => void) => void;
    }
    /** Main implementation of an EditableBook. Uses a string as a store. */
    export const stringBook: (initialText?: string) => {
        "__#1@#cachedIndex": BookIndex | undefined;
        "__#1@#cachedContent": BookContent | undefined;
        "__#1@#text": string;
        steps: Array<QueueStep>;
        set(newText: string): void;
        readonly text: string;
        readonly index: BookIndex;
        readonly content: BookContent;
        replace(from: number, to: number, newText: string): void;
        apply(transformation: (book: any) => void): void;
    };
    export const bookify: (bookOrText: Book | string) => Book;
    export const chaptersOf: (bookOrText: Book | string) => [BookChapter, BookChapterContent][];
    /**
     * Finds and retrieves the first unused key for a given book or text input.
     * @param bookOrText The input book or text to search for an available key.
     * @returns The first available key as a string.
     */
    export const firstAvaiableKey: (bookOrText: Book | string) => string;
    /**
     * Find the best place where to insert a new chapter with the set key.
     * Makes educated guesses on what should be the intended place from a human perspective.
     *
     * @return The chapter index where the new key should be place. chapterIndex == 0 means before any other chapter,
     *  chapterIndex == book.index.chapters.length means after any other chapter.
     */
    export const findNewKeyIndex: (bookOrText: Book | string, key: string, $selectedChapterIndex?: number) => number;
    export type ChapterData = {
        key: string;
        title?: string;
        flags?: string[];
        group?: string;
        content?: string;
        beforeSpaceLines?: number;
        afterSpaceLines?: number;
    };
    export const chapterText: ({ key, title, flags, group, content, beforeSpaceLines, afterSpaceLines }: ChapterData) => string;
    export const addChapter: (book: EditableBook, { key, title, flags, group, content, }: {
        key?: string;
        title?: string;
        flags?: any[];
        group?: string;
        content?: string;
    }, $selectedChapterIndex?: number) => [number, string];
    export const deleteChapter: (book: EditableBook, chapterIndex: number) => void;
    export const editChapter: (book: EditableBook, chapterIndex: number, { key, title, flags, group, content, }: {
        key?: string;
        title?: string;
        flags?: any[];
        group?: string;
        content?: string;
    }, $selectedChapterIndex?: number) => void;
    export const chapterHeading: (key: string, title?: string) => string;
    export const remapLinks: (text: string, inverseKeyMap: Record<string, string>, disableShortLinks?: boolean) => string;
    /**
     *
     * @param bookOrText
     * @param map Pair of numbers, where to remap each chapterIndex
     * @returns
     */
    export const remapMoveChapters: (bookOrText: Book | string, map: Record<number, number>) => string;
    export type ChapterFilter = {
        selectedFlags?: string[];
        groupsFilter?: string[];
        onlyNumbers?: boolean;
    };
    export const shuffleBook: (bookOrText: Book | string, filter?: ChapterFilter) => string;
    /** ChapterFilter option "onlyNumbers" is, of course, always overwritten to true */
    export const compactBook: (bookOrText: Book | string, filter?: ChapterFilter) => string;
    export const sortBook: (bookOrText: Book | string, filter?: ChapterFilter) => string;
    type QueueStep = {
        type: string;
        newText: string;
        from?: number;
        to?: number;
    };
}
declare module "javascript/formats/md" {
    import type { Book } from "javascript/book-utils";
    const mimetype = "text/markdown";
    const extension = "magebook";
    const decode: (file: string) => string;
    const encode: (bookOrText: Book | string) => {
        encodedBook: string;
        mimetype: string;
        extension: string;
    };
    export { mimetype, decode, encode, extension };
}
declare module "javascript/encoder" {
    import { marked } from 'marked';
    import type { Book, BookChapter } from "javascript/book-utils";
    export { marked };
    const raw: (t: string) => string;
    const mangle: (t: string) => string;
    export { raw, mangle };
    export const disableShortLinks: (disabled: boolean) => void;
    export const encodeToHTML: (text: string, renderer?: any) => string;
    export const trimHTML: (htmlText: string) => any;
    export const sanitizeProperties: (p?: Record<string, string>) => {
        disableShortLinks: boolean;
        page: {
            width: string;
            height: string;
            margins: string[];
        };
        textFont: {
            family: string;
            spacing: string;
            size: string;
        };
        titleFont: {
            family: string;
            spacing: string;
            size: string;
        };
        titleStyle: string;
        renameTitle: Function;
        renameLink: Function;
        renameAnchor: Function;
        advancedFormat: string[];
    };
    export type ExportProperties = ReturnType<typeof sanitizeProperties>;
    export const renameKeyAndTitle: (properties: ExportProperties, book: Book, chapter: BookChapter) => {
        renamedKey: any;
        renamedTitle: any;
    };
}
declare module "javascript/formats/docx" {
    import { type Book } from "javascript/book-utils";
    const mimetype = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const extension = "docx";
    const encode: (bookOrText: Book | string) => {
        encodedBook: string;
        mimetype: string;
        extension: string;
        blob: Promise<Blob>;
    };
    export { encode, mimetype, extension };
}
declare module "javascript/formats/fodt-template" {
    import type { ExportProperties } from "javascript/encoder";
    const customStyles = "\n  <style:style style:name=\"right\" style:family=\"paragraph\" style:parent-style-name=\"Standard\">\n    <style:paragraph-properties fo:text-align=\"end\" style:justify-single-word=\"false\"/>\n  </style:style>\n  <style:style style:name=\"justify\" style:family=\"paragraph\" style:parent-style-name=\"Standard\">\n    <style:paragraph-properties fo:text-align=\"justify\" style:justify-single-word=\"false\"/>\n  </style:style>\n  <style:style style:name=\"break\" style:family=\"paragraph\" style:parent-style-name=\"Standard\">\n    <style:paragraph-properties fo:break-after=\"page\"/>\n  </style:style>\n  <style:style style:name=\"bold\" style:family=\"text\">\n   <style:text-properties fo:font-weight=\"bold\" style:font-weight-asian=\"bold\" style:font-weight-complex=\"bold\"/>\n  </style:style>\n  <style:style style:name=\"underline\" style:family=\"text\">\n    <style:text-properties style:text-underline-style=\"solid\" style:text-underline-width=\"auto\" style:text-underline-color=\"font-color\"/>\n  </style:style>\n  <style:style style:name=\"italic\" style:family=\"text\">\n    <style:text-properties fo:font-style=\"italic\" style:font-style-asian=\"italic\" style:font-style-complex=\"italic\"/>\n  </style:style>";
    const testContent = "\n<text:p text:style-name=\"center\"><text:span text:style-name=\"bold\"><text:bookmark-start text:name=\"mageintro\"/>Introduzione<text:bookmark-end text:name=\"lgcjsintro\"/></text:span></text:p>\n<text:p text:style-name=\"Standard\">Questa \u00E8 l\u2019introduzione. <text:span text:style-name=\"bold\">Testo in grassetto. </text:span></text:p>\n<text:p text:style-name=\"Standard\"><text:span text:style-name=\"italic\">Testo in corsivo, <text:span text:style-name=\"bold\">testo in grassetto corsivo</text:span>.</text:span></text:p>\n<text:p text:style-name=\"Standard\"><text:span text:style-name=\"underline\">Testo underline.</text:span></text:p>\n<text:p text:style-name=\"Standard\"></text:p>\n<text:p text:style-name=\"right\">Testo a destra</text:p>\n<text:p text:style-name=\"center\">Testo a centro</text:p>\n<text:p text:style-name=\"justify\">Testo a destra</text:p>\n<text:p text:style-name=\"Standard\">Testo a sinistra</text:p>\n<text:p text:style-name=\"Standard\"/>\n<text:p text:style-name=\"center\"><text:span text:style-name=\"bold\"><text:bookmark-start text:name=\"lgcjsrules\"/>Regole<text:bookmark-end text:name=\"lgcjsrules\"/></text:span></text:p>\n<text:p text:style-name=\"Standard\">Regola 1</text:p>\n<text:p text:style-name=\"Standard\">Regola 2</text:p>\n<text:p text:style-name=\"break\"/>\n\n<text:p text:style-name=\"center\"><text:span text:style-name=\"bold\"><text:bookmark-start text:name=\"lgcjs2\"/>2<text:bookmark-end text:name=\"lgcjs2\"/></text:span></text:p>\n<text:p text:style-name=\"Standard\">Paragrafo 2, con un link<text:a xlink:type=\"simple\" xlink:href=\"#lgcjsrules\" text:style-name=\"Internet_20_link\" text:visited-style-name=\"Visited_20_Internet_20_Link\"> alle regole</text:a></text:p>\n<text:p text:style-name=\"Standard\"/>\n";
    const template: (content: string, properties: ExportProperties) => string;
    export { customStyles, testContent, template };
}
declare module "javascript/formats/fodt" {
    import { type Book } from "javascript/book-utils";
    const mimetype = "application/vnd.oasis.opendocument.text";
    const extension = "fodt";
    const encode: (bookOrText: Book | string) => {
        encodedBook: string;
        mimetype: string;
        extension: string;
    };
    export { encode, mimetype, extension };
}
declare module "javascript/formats/html" {
    import { type Book } from "javascript/book-utils";
    const mimetype = "text/html";
    const extension = "html";
    const encode: (bookOrText: Book | string) => {
        encodedBook: string;
        mimetype: string;
        extension: string;
    };
    export { encode, mimetype, extension };
}
declare module "javascript/formats/json" {
    import { type Book } from "javascript/book-utils";
    const mimetype = "text/json";
    const extension = "json";
    const decode: (file: string) => string;
    const encode: (bookOrText: Book | string) => {
        encodedBook: string;
        mimetype: string;
        extension: string;
    };
    export { mimetype, extension, decode, encode };
}
declare module "javascript/formats/xlgc" {
    import { type Book } from "javascript/book-utils";
    const mimetype = "application/xml";
    const extension = "xlgc";
    const decode: (text: string) => string;
    const encode: (bookOrText: Book | string) => {
        encodedBook: any;
        mimetype: string;
        extension: string;
    };
    export { encode, decode, mimetype, extension };
}
declare module "api" {
    import 'firebase/compat/database';
    export const getTextOfRemoteBook: (url: string) => Promise<string>;
    export * from "javascript/book-utils";
    export * as md from "javascript/formats/md";
    export * as docx from "javascript/formats/docx";
    export * as fodt from "javascript/formats/fodt";
    export * as html from "javascript/formats/html";
    export * as json from "javascript/formats/json";
    export * as xlgc from "javascript/formats/xlgc";
}
