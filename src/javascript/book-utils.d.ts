export declare const sanitizeKey: (key: string) => string;
export declare const atLinePosition: (text: string, lineNumber: number, end?: boolean) => void;
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
    properties: {
        [property: string]: string;
    };
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
export declare const indexBook: (bookText: string) => BookIndex;
export type BookChapterContent = {
    text: string;
    content: string;
};
export type BookContent = {
    titlePage: string;
    chapters: BookChapterContent[];
};
export declare const contentBook: (bookOrText: string, index?: BookIndex) => {
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
export declare const stringBook: (initialText?: string) => EditableBook;
export declare const bookify: (bookOrText: Book | string) => Book;
export declare const chaptersOf: (bookOrText: Book | string) => [BookChapter, BookChapterContent][];
/**
 * Finds and retrieves the first unused key for a given book or text input.
 * @param bookOrText The input book or text to search for an available key.
 * @returns The first available key as a string.
 */
export declare const firstAvaiableKey: (bookOrText: Book | string) => string;
/**
 * Find the best place where to insert a new chapter with the set key.
 * Makes educated guesses on what should be the intended place from a human perspective.
 *
 * @return The chapter index where the new key should be place. chapterIndex == 0 means before any other chapter,
 *  chapterIndex == book.index.chapters.length means after any other chapter.
 */
export declare const findNewKeyIndex: (bookOrText: Book | string, key: string, $selectedChapterIndex?: number) => number;
export type ChapterData = {
    key: string;
    title?: string;
    flags?: string[];
    group?: string;
    content?: string;
    beforeSpaceLines?: number;
    afterSpaceLines?: number;
};
export declare const chapterText: ({ key, title, flags, group, content, beforeSpaceLines, afterSpaceLines }: ChapterData) => string;
export declare const addChapter: (book: EditableBook, { key, title, flags, group, content, }: {
    key?: string;
    title?: string;
    flags?: any[];
    group?: string;
    content?: string;
}, $selectedChapterIndex?: number) => number;
export declare const deleteChapter: (book: EditableBook, chapterIndex: number) => void;
export declare const editChapter: (book: EditableBook, chapterIndex: number, { key, title, flags, group, content, }: {
    key?: string;
    title?: string;
    flags?: any[];
    group?: string;
    content?: string;
}, $selectedChapterIndex?: number) => void;
export declare const chapterHeading: (key: string, title?: string) => string;
export declare const remapLinks: (text: string, inverseKeyMap: Record<string, string>, disableShortLinks?: boolean) => string;
/**
 *
 * @param bookOrText
 * @param map Pair of numbers, where to remap each chapterIndex
 * @returns
 */
export declare const remapMoveChapters: (bookOrText: Book | string, map: Record<number, number>) => string;
export type ChapterFilter = {
    selectedFlags?: string[];
    groupsFilter?: string[];
    onlyNumbers?: boolean;
};
export declare const shuffleBook: (bookOrText: Book | string, filter?: ChapterFilter) => string;
/** ChapterFilter option "onlyNumbers" is, of course, always overwritten to true */
export declare const compactBook: (bookOrText: Book | string, filter?: ChapterFilter) => string;
export declare const sortBook: (bookOrText: Book | string, filter?: ChapterFilter) => string;
