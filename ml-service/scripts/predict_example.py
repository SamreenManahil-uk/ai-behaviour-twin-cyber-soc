"""Demonstrate a real test row; print truth separately, never pass target fields."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from cyber_soc_ml.data import RAW_DIR, read_csv, split_features
from cyber_soc_ml.modeling import SCORE_NOTES
from cyber_soc_ml.prediction import load_bundle, predict


def main():
    split = split_features(read_csv(RAW_DIR / "UNSW_NB15_testing-set.csv"))
    print(json.dumps({"true_label": int(split.y.iloc[0])}))
    print(json.dumps(predict(split.X.iloc[0].to_dict(), load_bundle()), indent=2))
    print(SCORE_NOTES)


if __name__ == "__main__":
    main()
