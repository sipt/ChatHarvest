const emojiRanges = [
  [0x1f32d, 0x1f32f],
  [0x1f340, 0x1f393],
  [0x1f396, 0x1f397],
  [0x1f399, 0x1f39b],
  [0x1f39e, 0x1f3f0],
  [0x1f400, 0x1f43f],
  [0x1f600, 0x1f64f],
  [0x1f680, 0x1f6a4],
  [0x1f9d0, 0x1f9e6],
  [0x1f980, 0x1f987],
  [0x1f990, 0x1f995],
  [0x1f4a0, 0x1f4fd],
];

class EmojiPool {
  private emojis: string[] = [];
  constructor(ranges: number[][]) {
    for (const [start, end] of ranges) {
      for (let i = start; i <= end; i++) {
        this.emojis.push(String.fromCodePoint(i));
      }
    }
  }

  public getRandomEmoji(): string {
    const index = Math.floor(Math.random() * this.emojis.length);
    return this.emojis[index];
  }

  public getAllEmojis(): string[] {
    return this.emojis;
  }
}

const emojiPool = new EmojiPool(emojiRanges);
export { emojiPool, EmojiPool };
