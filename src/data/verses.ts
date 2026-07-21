export interface BibleVerse {
  reference: string;
  text: string;
}

/** Public-domain wording (WEB-style) for daily encouragement. */
export const BIBLE_VERSES: BibleVerse[] = [
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
  },
  {
    reference: "Jeremiah 29:11",
    text: "I know the plans I have for you… plans to give you hope and a future.",
  },
  {
    reference: "Isaiah 41:10",
    text: "Don’t be afraid, for I am with you. Don’t be dismayed, for I am your God.",
  },
  {
    reference: "Psalm 23:1",
    text: "The LORD is my shepherd; I shall not want.",
  },
  {
    reference: "Romans 8:28",
    text: "All things work together for good for those who love God.",
  },
  {
    reference: "Psalm 46:1",
    text: "God is our refuge and strength, a very present help in trouble.",
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who labor and are heavily burdened, and I will give you rest.",
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Do not be afraid… for the LORD your God is with you.",
  },
  {
    reference: "Psalm 118:24",
    text: "This is the day that the LORD has made. We will rejoice and be glad in it.",
  },
  {
    reference: "2 Timothy 1:7",
    text: "God didn’t give us a spirit of fear, but of power, love, and self-control.",
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the LORD with all your heart… and he will direct your paths.",
  },
  {
    reference: "Lamentations 3:22-23",
    text: "His mercies are new every morning; great is your faithfulness.",
  },
  {
    reference: "Nahum 1:7",
    text: "The LORD is good, a stronghold in the day of trouble.",
  },
  {
    reference: "Psalm 34:18",
    text: "The LORD is near to those who have a broken heart.",
  },
  {
    reference: "1 Peter 5:7",
    text: "Cast all your worries on him, because he cares for you.",
  },
];

export function verseForCheckinDate(isoDate: string): BibleVerse {
  let hash = 0;
  for (let i = 0; i < isoDate.length; i++) {
    hash = (hash * 31 + isoDate.charCodeAt(i)) >>> 0;
  }
  return BIBLE_VERSES[hash % BIBLE_VERSES.length];
}
