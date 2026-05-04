"""Merge all raw data files into a single training corpus and create train/val split."""
import os
import random

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "processed")

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    all_text = []

    for fname in sorted(os.listdir(RAW_DIR)):
        if fname.endswith(".txt"):
            path = os.path.join(RAW_DIR, fname)
            with open(path, "r", encoding="utf-8") as f:
                text = f.read().strip()
                if text:
                    all_text.append(text)
                    print(f"  Loaded {fname} ({len(text):,} chars)")

    corpus = "\n\n".join(all_text)
    print(f"\nTotal corpus: {len(corpus):,} chars")

    # Split conversations for train/val
    conversations = corpus.split("<|system|>")
    conversations = ["<|system|>" + c for c in conversations if c.strip()]
    random.seed(42)
    random.shuffle(conversations)

    split = int(len(conversations) * 0.9)
    train = "\n\n".join(conversations[:split])
    val = "\n\n".join(conversations[split:])

    with open(os.path.join(OUT_DIR, "train.txt"), "w", encoding="utf-8") as f:
        f.write(train)
    with open(os.path.join(OUT_DIR, "val.txt"), "w", encoding="utf-8") as f:
        f.write(val)

    print(f"Train: {len(conversations[:split])} conversations ({len(train):,} chars)")
    print(f"Val:   {len(conversations[split:])} conversations ({len(val):,} chars)")

if __name__ == "__main__":
    main()
