"""Inspect the local UNSW-NB15 splits without changing data or training models."""

import csv
import sys
from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
SPLITS = {"training": 175_341, "testing": 82_332}
TARGETS = {"label", "attack_cat"}


def load_dataset(path: Path) -> pd.DataFrame:
    """Reject malformed CSVs; strip only leading/trailing header whitespace."""
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.reader(source, strict=True)
        columns = [column.strip() for column in next(reader, [])]
        if not columns or any(not column for column in columns):
            raise ValueError(f"{path.name}: empty or missing column names")
        if len(columns) != len(set(columns)):
            raise ValueError(f"{path.name}: duplicate normalized column names")
        missing = TARGETS.difference(columns)
        if missing:
            raise ValueError(f"{path.name}: missing target columns: {sorted(missing)}")
        for row in reader:
            if len(row) != len(columns):
                raise ValueError(
                    f"{path.name}: CSV line {reader.line_num} has {len(row)} "
                    f"fields; expected {len(columns)}"
                )
    # Preserve literal strings such as 'NA' and '-' rather than imputing them.
    # Only empty cells are interpreted as missing. No cell values are stripped.
    frame = pd.read_csv(
        path, encoding="utf-8-sig", low_memory=False, on_bad_lines="error",
        keep_default_na=False, na_values=[""],
    )
    frame.columns = columns
    return frame


def report(name: str, frame: pd.DataFrame) -> None:
    print(f"\n{name}: shape={frame.shape}")
    print(f"Columns: {frame.columns.tolist()}")
    print("Dtypes:\n" + frame.dtypes.to_string())
    print("Missing values (empty cells) per column:\n" + frame.isna().sum().to_string())
    print(f"Duplicate rows (all columns, including id): {frame.duplicated().sum()}")
    for target in sorted(TARGETS):
        print(f"{target} distribution (including missing):")
        print(frame[target].value_counts(dropna=False).sort_index().to_string())


def main() -> int:
    try:
        frames = {}
        for split, expected_rows in SPLITS.items():
            path = RAW_DIR / f"UNSW_NB15_{split}-set.csv"
            frame = load_dataset(path)
            report(path.name, frame)
            if len(frame) != expected_rows:
                raise ValueError(
                    f"{path.name}: expected {expected_rows} records, got {len(frame)}"
                )
            if frame["label"].isna().any() or not frame["label"].isin([0, 1]).all():
                raise ValueError(f"{path.name}: label must contain only 0 and 1")
            frames[split] = frame
        train, test = frames["training"], frames["testing"]
        if not train.columns.equals(test.columns):
            raise ValueError("Train/test column names or order do not match")
        if not train.dtypes.equals(test.dtypes):
            raise ValueError("Train/test inferred dtypes do not match")
        print("\nPASS: train/test schemas (ordered columns and dtypes) match.")
        return 0
    except (OSError, UnicodeError, csv.Error, ValueError, pd.errors.ParserError) as exc:
        print(f"Dataset inspection failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
