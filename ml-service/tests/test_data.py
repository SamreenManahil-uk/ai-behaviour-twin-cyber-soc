"""Synthetic validation of data boundaries and CSV integrity."""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from cyber_soc_ml.data import (
    feature_columns,
    load_splits,
    non_finite_counts,
    read_csv,
    validate_schemas,
)


def sample():
    return pd.DataFrame({"id": [1, 2, 3], "bytes": [1., 3., np.nan],
                         "proto": ["tcp", "udp", np.nan],
                         "attack_cat": ["Normal", "DoS", "DoS"], "label": [0, 1, 1]})


def test_loading_preserves_splits_and_raw_bytes(tmp_path):
    train, test = sample(), sample()
    test["bytes"] = [100., 200., 300.]
    paths = [tmp_path / f"UNSW_NB15_{name}-set.csv" for name in ("training", "testing")]
    for frame, path in zip((train, test), paths):
        frame.to_csv(path, index=False)
    before = [path.read_bytes() for path in paths]
    training, testing = load_splits(tmp_path)
    assert list(training.X) == ["bytes", "proto"]
    assert list(testing.X) == ["bytes", "proto"]
    assert training.X.bytes.iloc[0] == 1
    assert testing.X.bytes.iloc[0] == 100
    assert training.y.tolist() == [0, 1, 1]
    assert training.attack_cat.tolist() == ["Normal", "DoS", "DoS"]
    assert feature_columns(training.X) == (["proto"], ["bytes"])
    assert before == [path.read_bytes() for path in paths]


@pytest.mark.parametrize("label", [2, -1, np.nan, "attack"])
def test_invalid_label(label):
    frame = sample()
    frame["label"] = pd.Series([0, 1, label])
    with pytest.raises(ValueError, match="label must contain only 0 and 1"):
        validate_schemas(sample(), frame)


@pytest.mark.parametrize("change, message", [
    (lambda f: f.drop(columns="id"), "missing required columns"),
    (lambda f: f.rename(columns={"bytes": "packets"}), "ordered column names"),
    (lambda f: f.astype({"bytes": "str"}), "inferred dtypes"),
    (lambda f: f.iloc[:, ::-1], "ordered column names"),
])
def test_schema_errors(change, message):
    with pytest.raises(ValueError, match=message):
        validate_schemas(sample(), change(sample()))


def test_non_finite_detection():
    counts = non_finite_counts(pd.DataFrame({"x": [np.nan, np.inf, -np.inf, 2.]}))
    assert counts.loc["x"].tolist() == [1, 1, 1]


@pytest.mark.parametrize("content, message", [
    ("id,id\n1,2\n", "duplicate"),
    ("id,label\n1,0,extra\n", "malformed CSV"),
])
def test_malformed_csv(tmp_path, content, message):
    path = tmp_path / "bad.csv"
    path.write_text(content)
    with pytest.raises(ValueError, match=message):
        read_csv(path)
