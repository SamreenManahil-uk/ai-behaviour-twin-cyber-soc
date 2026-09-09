"""Read official split files without changing raw bytes or mixing splits."""

import csv
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
from pandas.api.types import is_numeric_dtype, is_string_dtype

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"
EXCLUDED = {"id", "label", "attack_cat"}


@dataclass(frozen=True)
class DatasetSplit:
    X: pd.DataFrame
    y: pd.Series
    attack_cat: pd.Series


def read_csv(path: Path) -> pd.DataFrame:
    """Validate CSV structure and preserve literal markers such as '-' and 'NA'."""
    with path.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.reader(source, strict=True)
        columns = [column.strip() for column in next(reader, [])]
        if not columns or any(not column for column in columns):
            raise ValueError(f"{path.name}: empty or missing column names")
        if len(columns) != len(set(columns)):
            raise ValueError(f"{path.name}: duplicate normalized column names")
        for row in reader:
            if len(row) != len(columns):
                raise ValueError(f"{path.name}: malformed CSV line {reader.line_num}")
    frame = pd.read_csv(
        path, encoding="utf-8-sig", low_memory=False,
        keep_default_na=False, na_values=[""], on_bad_lines="error",
    )
    frame.columns = columns
    return frame


def validate_schemas(train: pd.DataFrame, test: pd.DataFrame) -> None:
    """Require matching ordered columns and inferred dtypes, and binary labels."""
    for name, frame in (("training", train), ("testing", test)):
        missing = EXCLUDED.difference(frame.columns)
        if missing:
            raise ValueError(f"{name}: missing required columns: {sorted(missing)}")
        if not frame.columns.is_unique:
            raise ValueError(f"{name}: duplicate column names")
        if frame.empty:
            raise ValueError(f"{name}: split is empty")
        if frame.label.isna().any() or not frame.label.isin([0, 1]).all():
            raise ValueError(f"{name}: label must contain only 0 and 1 (no missing values)")
    if not train.columns.equals(test.columns):
        raise ValueError("Train/test schema mismatch: ordered column names differ")
    if not train.dtypes.equals(test.dtypes):
        raise ValueError("Train/test schema mismatch: inferred dtypes differ")


def feature_columns(X: pd.DataFrame) -> tuple[list[str], list[str]]:
    """Infer categorical/numeric predictors from training schema only."""
    if EXCLUDED.intersection(X.columns):
        raise ValueError("Predictive features must exclude id, label and attack_cat")
    numeric, categorical = [], []
    for column in X:
        dtype = X[column].dtype
        if is_numeric_dtype(dtype):
            numeric.append(column)
        elif is_string_dtype(dtype) or isinstance(dtype, pd.CategoricalDtype):
            categorical.append(column)
        else:
            raise ValueError(f"Unsupported feature dtype: {column} ({dtype})")
    return categorical, numeric


def non_finite_counts(frame: pd.DataFrame) -> pd.DataFrame:
    """Count NaN/missing and signed infinities separately for numeric columns."""
    numeric = frame.select_dtypes(include="number")
    return pd.DataFrame({
        "missing": numeric.isna().sum(),
        "positive_infinity": numeric.eq(np.inf).sum(),
        "negative_infinity": numeric.eq(-np.inf).sum(),
    })


def split_features(frame: pd.DataFrame) -> DatasetSplit:
    """Keep descriptive attack categories separate from the binary learning task."""
    return DatasetSplit(
        frame.drop(columns=sorted(EXCLUDED)).copy(),
        frame["label"].copy(), frame["attack_cat"].copy(),
    )


def load_splits(raw_dir: Path = RAW_DIR) -> tuple[DatasetSplit, DatasetSplit]:
    train = read_csv(raw_dir / "UNSW_NB15_training-set.csv")
    test = read_csv(raw_dir / "UNSW_NB15_testing-set.csv")
    validate_schemas(train, test)
    return split_features(train), split_features(test)
